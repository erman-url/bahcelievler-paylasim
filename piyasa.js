/* >> BAHÇELİEVLER FORUM - PİYASA MOTORU V1.0 << */

const PiyasaMotoru = {
    // Ortalama.net mantığı: Topluluk verilerinden istatistik üretir
    istatistikHesapla: function(barkod, yeniFiyat, tumVeriler) {
        const urunGecmisi = tumVeriler.filter(item => item.barkod === barkod);
        
        if (urunGecmisi.length === 0) {
            return { durum: "Yeni", mesaj: "İlk kez radara girdi.", sapma: 0 };
        }

        const fiyatlar = urunGecmisi.map(u => parseFloat(u.fiyat));
        const ortalama = fiyatlar.reduce((a, b) => a + b, 0) / fiyatlar.length;
        
        const sapma = ((yeniFiyat - ortalama) / ortalama) * 100;

        return {
            ortalama: ortalama.toFixed(2),
            sapma: sapma.toFixed(2),
            durum: sapma > 5 ? "Pahalı" : sapma < -5 ? "Hesaplı" : "Normal",
            seviye: Math.abs(sapma) > 20 ? "Yüksek Sapma" : "Stabil"
        };
    },

    // Süper Kontrol: Görsel zorunluluğu [cite: 2025-12-16]
    girdiKontrol: function(veri) {
        if (!veri.image) return { hata: true, mesaj: "Görsel kanıt (fotoğraf) zorunludur!" };
        if (!veri.fiyat || veri.fiyat <= 0) return { hata: true, mesaj: "Geçerli bir fiyat giriniz." };
        if (!veri.barkod) return { hata: true, mesaj: "Barkod veya Ürün Kodu zorunludur!" };
        return { hata: false };
    },

    // Fiyat Dedektifi Listesini Render Et
    listeOlustur: function(veriler) {
        const container = document.getElementById('fiyat-dedektifi-listesi');
        if (!container) return;

        if (!veriler || veriler.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding:20px;">Henüz fiyat girişi yapılmamış.</p>`;
            return;
        }

        container.innerHTML = veriler.map(urun => {
            const analiz = this.istatistikHesapla(urun.barkod, urun.fiyat, veriler);
            const durumClass = analiz.durum === "Pahalı" ? "cyber-pink" : "cyber-blue";

            return `
                <div class="cyber-card" style="margin-bottom:12px; border-left: 5px solid var(--${durumClass});">
                    <div style="display:flex; gap:10px;">
                        <img src="${urun.image_url}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between;">
                                <small style="font-size:0.6rem; color:#888;">Barkod: ${urun.barkod}</small>
                                <small style="color:var(--${durumClass}); font-weight:bold;">${analiz.durum}</small>
                            </div>
                            <h4 style="margin:2px 0;">${urun.urun_adi}</h4>
                            <div style="font-weight:bold; color:var(--dark);">${urun.fiyat} TL</div>
                            <div style="font-size:0.7rem; margin-top:4px;">
                                Radar: <span style="color:var(--${durumClass})">%${analiz.sapma} sapma</span> 
                                (Ort: ${analiz.ortalama} TL)
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
};

// Sayfa yüklendiğinde otomatik çalışması için global scope'a ekliyoruz
window.PiyasaMotoru = PiyasaMotoru;


/* >> PİYASA VERİ KAYIT MOTORU << */
async function submitPiyasaVerisi() {
    const fileInput = document.getElementById("piyasa-file");
    const barkod = document.getElementById("piyasa-barkod").value;
    const fiyat = parseFloat(document.getElementById("piyasa-fiyat").value);
    const urunAdi = document.getElementById("piyasa-urun-adi").value;
    const marketAdi = document.getElementById("piyasa-market").value;
    const pass = document.getElementById("piyasa-pass").value;

    // SÜPER KONTROL: Görsel ve Veri Denetimi [cite: 2025-12-16]
    const kontrol = window.PiyasaMotoru.girdiKontrol({ image: fileInput.files[0], fiyat, barkod });
    if (kontrol.hata) {
        alert(kontrol.mesaj);
        return;
    }

    try {
        // 1. Görseli Storage'a Yükle (piyasa-kanitlar bucketına)
        const file = fileInput.files[0];
        const fileName = `kanit_${Date.now()}_${barkod}.jpg`;
        const { data: uploadData, error: uploadError } = await window.supabase.storage
            .from('piyasa-kanitlar')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = window.supabase.storage.from('piyasa-kanitlar').getPublicUrl(fileName);
        const imageUrl = urlData.publicUrl;

        // 2. Veritabanına (piyasa_verileri tablosuna) Kaydet
        const { error: dbError } = await window.supabase.from('piyasa_verileri').insert([{
            barkod: barkod,
            urun_adi: urunAdi,
            fiyat: fiyat,
            market_adi: marketAdi,
            image_url: imageUrl,
            delete_password: pass
        }]);

        if (dbError) throw dbError;

        alert("Fiyat başarıyla radara eklendi!");
        document.getElementById("piyasa-form").reset();
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