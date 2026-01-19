/* >> BAHÇELİEVLER FORUM - PİYASA MOTORU V1.1 (Barkodsuz) << */

const PiyasaMotoru = {
    // Analiz artık barkod yerine Ürün Adı üzerinden benzerlik kurar
    istatistikHesapla: function(urunAdi, yeniFiyat, tumVeriler) {
        // Ürün adını küçük harfe çevirip boşlukları temizleyerek eşleştirme yapar
        const urunGecmisi = tumVeriler.filter(item => 
            item.urun_adi.toLowerCase().trim() === urunAdi.toLowerCase().trim()
        );
        
        if (urunGecmisi.length === 0) {
            return { durum: "Yeni", mesaj: "İlk kez radara girdi.", sapma: 0 };
        }

        const fiyatlar = urunGecmisi.map(u => parseFloat(u.fiyat));
        const ortalama = fiyatlar.reduce((a, b) => a + b, 0) / fiyatlar.length;
        const sapma = ((yeniFiyat - ortalama) / ortalama) * 100;

        return {
            ortalama: ortalama.toFixed(2),
            sapma: sapma.toFixed(2),
            durum: sapma > 5 ? "Pahalı" : sapma < -5 ? "Hesaplı" : "Normal"
        };
    },

    // SÜPER KONTROL: Barkod kaldırıldı, GÖRSEL ZORUNLU! [cite: 1, 2025-12-16]
    girdiKontrol: function(veri) {
        if (!veri.image) return { hata: true, mesaj: "Görsel kanıt (fotoğraf) zorunludur!" };
        if (!veri.fiyat || veri.fiyat <= 0) return { hata: true, mesaj: "Geçerli bir fiyat giriniz." };
        if (!veri.urunAdi) return { hata: true, mesaj: "Ürün adı zorunludur!" };
        return { hata: false };
    },

    listeOlustur: function(veriler) {
        const container = document.getElementById('fiyat-dedektifi-listesi');
        if (!container) return;

        if (!veriler || veriler.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding:20px;">Henüz fiyat girişi yapılmamış.</p>`;
            return;
        }

        container.innerHTML = veriler.map(urun => {
            // Analiz parametresi Ürün Adı üzerinden çalışır
            const analiz = this.istatistikHesapla(urun.urun_adi, urun.fiyat, veriler);
            
            // SÜPER KONTROL: CSS'deki küçük harf sınıflarla uyum sağlandı
            const durumClass = analiz.durum === "pahali" ? "cyber-pink" : "cyber-blue";

            return `
                <div class="cyber-card" style="margin-bottom:12px; border-left: 5px solid var(--${durumClass});">
                    <div style="display:flex; gap:10px;">
                        <img src="${urun.image_url}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between;">
                                <small style="font-size:0.6rem; color:#888;">Radar Girişi</small>
                                <small style="color:var(--${durumClass}); font-weight:bold;">${analiz.durum.toUpperCase()}</small>
                            </div>
                            <h4 style="margin:2px 0;">${urun.urun_adi}</h4>
                            <div style="font-weight:bold; color:var(--dark);">${urun.fiyat} TL</div>
                            <div style="font-size:0.7rem; margin-top:4px;">
                                Radar: <span style="color:var(--${durumClass})">%${analiz.sapma} sapma</span> 
                                <br><small>İşletme: ${urun.market_adi}</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
};

window.PiyasaMotoru = PiyasaMotoru;

/* >> PİYASA VERİ KAYIT MOTORU << */
async function submitPiyasaVerisi() {
    const fileInput = document.getElementById("piyasa-file");
    const fiyat = parseFloat(document.getElementById("piyasa-fiyat").value);
    const urunAdi = document.getElementById("piyasa-urun-adi").value;
    const marketAdi = document.getElementById("piyasa-market").value;
    const pass = document.getElementById("piyasa-pass").value;

    // SÜPER KONTROL: Barkod parametresi çıkarıldı [cite: 1, 2025-12-16]
    const kontrol = window.PiyasaMotoru.girdiKontrol({ image: fileInput.files[0], fiyat, urunAdi });
    if (kontrol.hata) {
        alert(kontrol.mesaj);
        return;
    }

    try {
        const file = fileInput.files[0];
        const fileName = `kanit_${Date.now()}.jpg`; // Barkodsuz isimlendirme
        const { data: uploadData, error: uploadError } = await window.supabase.storage
            .from('piyasa-kanitlar')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = window.supabase.storage.from('piyasa-kanitlar').getPublicUrl(fileName);

        // Veritabanı kaydında barkod gönderilmiyor
        const { error: dbError } = await window.supabase.from('piyasa_verileri').insert([{
            urun_adi: urunAdi,
            fiyat: fiyat,
            market_adi: marketAdi,
            image_url: urlData.publicUrl,
            delete_password: pass
        }]);

        if (dbError) throw dbError;

        alert("Fiyat radara eklendi!");
        document.getElementById("piyasa-form").reset();
        loadPortalData(); // Dashboard widget'ını ve listeyi yeniler
    } catch (err) {
        alert("Sistem Hatası: " + err.message);
    }
}

// app.js içine eklenecek fonksiyon
async function fetchAndRenderPiyasa() {
    const { data, error } = await window.supabase
        .from('piyasa_verileri')
        .select('*')
        .order('created_at', { ascending: false });

    if (!error && data) {
        window.PiyasaMotoru.listeOlustur(data);
    }
}

// loadPortalData() içindeki Promise.allSettled kısmına bunu da ekle:
// fetchAndRenderPiyasa()