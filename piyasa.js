/* >> BAHÇELİEVLER FORUM - PİYASA MOTORU V2.0 (TAM SÜRÜM - HATASIZ) << */
window.PiyasaMotoruReady = true;

const PiyasaMotoru = {
    // Analiz barkod yerine Ürün Adı üzerinden benzerlik kurar
    istatistikHesapla: function(urunAdi, yeniFiyat, tumVeriler) {
        // Ürün adını temizleyerek eşleştirme yapar
        const urunGecmisi = tumVeriler.filter(item => 
            item.urun_adi && item.urun_adi.toLowerCase().trim() === urunAdi.toLowerCase().trim()
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
            // CSS sınıflarıyla tam uyum: cyber-pink (pahalı) / cyber-blue (hesaplı-normal)
            durum: sapma > 5 ? "pahali" : sapma < -5 ? "hesapli" : "normal"
        };
    },
	
    girdiKontrol: function(veri) {
        // 1. Görsel kontrolü (Data toplama güvenliği için zorunlu [cite: 2026-01-19])
        if (!veri.file || typeof veri.file === 'undefined') {
            return { hata: true, mesaj: "HATA: Etiket/Barkod fotoğrafı eklemek zorunludur!" };
        }
        // 2. Fiyat kontrolü
        if (!veri.fiyat || isNaN(veri.fiyat) || veri.fiyat <= 0) {
            return { hata: true, mesaj: "HATA: Geçerli bir fiyat (örn: 50.50) girmelisiniz." };
        }
        // 3. Ürün adı kontrolü
        if (!veri.urunAdi || veri.urunAdi.trim().length < 2) {
            return { hata: true, mesaj: "HATA: Ürün adı çok kısa veya boş." };
        }
        return { hata: false };
    },

    /* >> Liste Oluşturma: Hem Aktifleri Gösterir Hem Tüm Veriyle Analiz Yapar << */
    listeOlustur: function(aktifVeriler, tumVeriler) {
        const container = document.getElementById('fiyat-dedektifi-listesi');
        if (!container) return;

        if (!aktifVeriler || aktifVeriler.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding:20px; color:#888;">Henüz aktif radar girişi yapılmamış.</p>`;
            return;
        }

        container.innerHTML = aktifVeriler.map(urun => {
            // Analiz artık silinen veriler dahil tüm geçmişi (tumVeriler) kullanır
            const analiz = this.istatistikHesapla(urun.urun_adi, urun.fiyat, tumVeriler);
            const durumClass = analiz.durum === "pahali" ? "cyber-pink" : "cyber-blue";
            const durumText = analiz.durum === "pahali" ? "YÜKSEK FİYAT" : analiz.durum === "hesapli" ? "UYGUN FİYAT" : "PİYASA FİYATI";

            return `
                <div class="cyber-card" style="margin-bottom:12px; border-left: 5px solid var(--${durumClass}); cursor:pointer;" onclick="window.openRadarDetail('${urun.id}')">
                    <div style="display:flex; gap:10px;">
                        <img src="${urun.image_url || 'https://via.placeholder.com/80'}" style="width:80px; height:80px; object-fit:cover; border-radius:8px; border:1px solid #eee;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between;">
                                <small style="font-size:0.6rem; color:#888;">#RADAR_${urun.id.toString().slice(-4)}</small>
                                <small style="color:var(--${durumClass}); font-weight:bold;">${durumText}</small>
                            </div>
                            <h4 style="margin:2px 0; font-size:0.95rem;">${urun.urun_adi}</h4>
                            <div style="font-weight:bold; color:var(--dark); font-size:1.1rem;">${new Intl.NumberFormat('tr-TR').format(urun.fiyat)} TL</div>
                            <div style="font-size:0.7rem; margin-top:4px; color:#555;">
                                <i class="fas fa-chart-line"></i> Sapma: <span style="color:var(--${durumClass})">%${analiz.sapma}</span> 
                                <br><i class="fas fa-store"></i> ${urun.market_adi}
                                <br><i class="fas fa-calendar-alt"></i> ${urun.tarih_etiketi || 'Tarih Belirtilmedi'}
                            </div>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }
};

window.PiyasaMotoru = PiyasaMotoru;

/* >> PİYASA VERİ KAYIT MOTORU (Soft-Delete Uyumlu) << */
async function submitPiyasaVerisi() {
    try {
        const fileInput = document.getElementById("piyasa-file");
        const fiyatInput = document.getElementById("piyasa-fiyat");
        const urunAdiInput = document.getElementById("piyasa-urun-adi");
        const barkodInput = document.getElementById("piyasa-barkod");
        const marketAdiInput = document.getElementById("piyasa-market");
        const passInput = document.getElementById("piyasa-pass");

        if(!fiyatInput || !urunAdiInput) return;

        const fiyat = parseFloat(fiyatInput.value);
        const urunAdi = urunAdiInput.value;
        const barkod = barkodInput ? barkodInput.value.trim() : null;
        const marketAdi = marketAdiInput.value;
        const pass = passInput.value;

        // --- SÜPER KONTROL: Giriş Doğrulama ---
        const kontrol = window.PiyasaMotoru.girdiKontrol({ 
            file: fileInput.files[0], 
            fiyat, 
            urunAdi 
        });
        
        if (kontrol.hata) {
            alert(kontrol.mesaj);
            return;
        }

        const file = fileInput.files[0];
        let publicUrl = null;

        const fileName = `kanit_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const { error: uploadError } = await window.supabase.storage
            .from('piyasa-kanitlar')
            .upload(fileName, file);

        if (uploadError) throw uploadError;
        const { data: urlData } = window.supabase.storage.from('piyasa-kanitlar').getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;

        const bugun = new Date().toLocaleDateString('tr-TR');

        // is_active: true mühürü ile kaydedilir (Data toplama amacı için [cite: 2026-01-19])
        const { error: dbError } = await window.supabase.from('piyasa_verileri').insert([{
            urun_adi: urunAdi,
            fiyat: fiyat,
            barkod: barkod, // DB'deki barkod sütununa veri gönderiliyor
            market_adi: marketAdi,
            image_url: publicUrl,
            delete_password: pass,
            tarih_etiketi: bugun,
            is_active: true 
        }]);

        if (dbError) throw dbError;

        alert("BAŞARILI: Fiyat radara eklendi!");
        document.getElementById("piyasa-form").reset();
        if (typeof loadPortalData === "function") loadPortalData(); 
        
    } catch (err) {
        alert("Sistem Hatası: " + err.message);
    }
}

/* >> RENDER MOTORU (Sadece Aktifleri Gösterir Ama Tümünü Analiz Eder) << */
async function fetchAndRenderPiyasa() {
    try {
        const { data: tumVeriler, error } = await window.supabase
            .from('piyasa_verileri')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (tumVeriler) {
            // Sadece is_active değeri false OLMAYANLARI filtrele (null veya true olanlar gelir)
            const aktifVeriler = tumVeriler.filter(u => u.is_active !== false);

            // Analiz için tumVeriler, görüntüleme için aktifVeriler gönderilir
            window.PiyasaMotoru.listeOlustur(aktifVeriler, tumVeriler);
        }
    } catch (e) {
        console.error("Radar veri çekme hatası:", e.message);
        const container = document.getElementById('fiyat-dedektifi-listesi');
        if (container) container.innerHTML = `<p style="text-align:center; color:red;">Veriler yüklenemedi.</p>`;
    }
}

async function renderEnflasyonGrafigi() {
    const ctx = document.getElementById('enflasyonChart');
    if (!ctx) return;

    // Analiz tablosundan verileri çek
    const { data, error } = await window.supabase
        .from("piyasa_analizi")
        .select('created_at, ortalama_fiyat')
        .order('created_at', { ascending: true })
        .limit(10);

    if (error) {
        console.error("Grafik Veri Hatası:", error);
        return;
    }

    if (!data || data.length === 0) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => new Date(d.created_at).toLocaleDateString('tr-TR')),
            datasets: [{
                label: 'Ortalama Fiyat (TL)',
                data: data.map(d => d.ortalama_fiyat),
                borderColor: '#ff007f',
                backgroundColor: 'rgba(255, 0, 127, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
        }
    });
}