/* >> BAHÇELİEVLER FORUM - PİYASA MOTORU V1.5 (STABİLİZE EDİLMİŞ) << */

const PiyasaMotoru = {
    // Analiz barkod yerine Ürün Adı üzerinden benzerlik kurar
    istatistikHesapla: function(urunAdi, yeniFiyat, tumVeriler) {
        // Ürün adını temizleyerek eşleştirme yapar
        const urunGecmisi = tumVeriler.filter(item => 
            item.urun_adi.toLowerCase().trim() === urunAdi.toLowerCase().trim()
        );
        
        if (urunGecmisi.length === 0) {
            return { durum: "yeni", sapma: 0 };
        }

        const fiyatlar = urunGecmisi.map(u => parseFloat(u.fiyat));
        const ortalama = fiyatlar.reduce((a, b) => a + b, 0) / fiyatlar.length;
        const sapma = ((yeniFiyat - ortalama) / ortalama) * 100;

        return {
            ortalama: ortalama.toFixed(2),
            sapma: sapma.toFixed(1),
            // SÜPER KONTROL: CSS .pahali ve .hesapli sınıflarıyla tam uyum
            durum: sapma > 5 ? "pahali" : sapma < -5 ? "hesapli" : "normal"
        };
    },

    // MANTIK KONTROLÜ: Görsel ve Fiyat Zorunluluğu [cite: 2025-12-16]
    girdiKontrol: function(veri) {
        if (!veri.image) return { hata: true, mesaj: "HATA: Görsel kanıt eklemek zorunludur!" };
        if (!veri.fiyat || veri.fiyat <= 0) return { hata: true, mesaj: "HATA: Geçerli bir fiyat girmelisiniz." };
        if (!veri.urunAdi || veri.urunAdi.length < 2) return { hata: true, mesaj: "HATA: Ürün adı çok kısa veya boş." };
        return { hata: false };
    },

    listeOlustur: function(veriler) {
        const container = document.getElementById('fiyat-dedektifi-listesi');
        if (!container) return;

        if (!veriler || veriler.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding:20px; color:#888;">Henüz radar girişi yapılmamış.</p>`;
            return;
        }

        container.innerHTML = veriler.map(urun => {
            const analiz = this.istatistikHesapla(urun.urun_adi, urun.fiyat, veriler);
            
            // Dinamik CSS sınıf ataması (cyber-pink = pahalı, cyber-blue = hesaplı/normal)
            const durumClass = analiz.durum === "pahali" ? "cyber-pink" : "cyber-blue";
            const durumText = analiz.durum === "pahali" ? "YÜKSEK FİYAT" : analiz.durum === "hesapli" ? "UYGUN FİYAT" : "PİYASA FİYATI";

            return `
                <div class="cyber-card" style="margin-bottom:12px; border-left: 5px solid var(--${durumClass});">
                    <div style="display:flex; gap:10px;">
                        <img src="${urun.image_url}" style="width:80px; height:80px; object-fit:cover; border-radius:8px; border:1px solid #eee;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between;">
                                <small style="font-size:0.6rem; color:#888;">#RADAR_${urun.id.toString().slice(-4)}</small>
                                <small style="color:var(--${durumClass}); font-weight:bold;">${durumText}</small>
                            </div>
                            <h4 style="margin:2px 0; font-size:0.95rem;">${urun.urun_adi}</h4>
                            <div style="font-weight:bold; color:var(--dark); font-size:1.1rem;">${urun.fiyat} TL</div>
                            <div style="font-size:0.7rem; margin-top:4px; color:#555;">
                                <i class="fas fa-chart-line"></i> Sapma: <span style="color:var(--${durumClass})">%${analiz.sapma}</span> 
                                <br><i class="fas fa-store"></i> ${urun.market_adi}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
};

window.PiyasaMotoru = PiyasaMotoru;

/* >> PİYASA VERİ KAYIT MOTORU (Supabase Entegre) << */
async function submitPiyasaVerisi() {
    const fileInput = document.getElementById("piyasa-file");
    const fiyat = parseFloat(document.getElementById("piyasa-fiyat").value);
    const urunAdi = document.getElementById("piyasa-urun-adi").value;
    const marketAdi = document.getElementById("piyasa-market").value;
    const pass = document.getElementById("piyasa-pass").value;

    const kontrol = window.PiyasaMotoru.girdiKontrol({ image: fileInput.files[0], fiyat, urunAdi });
    if (kontrol.hata) {
        alert(kontrol.mesaj);
        return;
    }

    try {
        const file = fileInput.files[0];
        const fileName = `kanit_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        
        // 1. Görseli Storage'a yükle
        const { data: uploadData, error: uploadError } = await window.supabase.storage
            .from('piyasa-kanitlar')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = window.supabase.storage.from('piyasa-kanitlar').getPublicUrl(fileName);

        // 2. Veriyi Database'e kaydet (Barkodsuz yapı)
        const { error: dbError } = await window.supabase.from('piyasa_verileri').insert([{
            urun_adi: urunAdi,
            fiyat: fiyat,
            market_adi: marketAdi,
            image_url: urlData.publicUrl,
            delete_password: pass
        }]);

        if (dbError) throw dbError;

        alert("BAŞARILI: Fiyat radara eklendi!");
        document.getElementById("piyasa-form").reset();
        
        // Dashboard ve listeyi yenile
        if (typeof loadPortalData === "function") loadPortalData(); 
        
    } catch (err) {
        alert("Sistem Hatası: " + err.message);
    }
}

// app.js üzerinden çağrılan render motoru
async function fetchAndRenderPiyasa() {
    try {
        const { data, error } = await window.supabase
            .from('piyasa_verileri')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            window.PiyasaMotoru.listeOlustur(data);
        }
    } catch (e) {
        console.error("Veri çekme hatası:", e.message);
    }
}