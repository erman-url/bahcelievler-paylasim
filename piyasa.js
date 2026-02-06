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
                            <div style="font-weight:bold; color:var(--dark); font-size:1.1rem;">${new Intl.NumberFormat('tr-TR').format(urun.fiyat)} TL <button onclick="uDelete('${urun.id}', 'piyasa_verileri', true)" style="color:var(--cyber-pink); b
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

        // Girdi Zorunluluğu Mühürü
        if (!barkodInput || !barkodInput.value.trim() || !urunAdiInput.value.trim() || !fiyatInput.value.trim() || !marketAdiInput.value || !passInput.value.trim()) {
            alert("HATA: Lütfen tüm alanları doldurunuz (Barkod, Ürün, Fiyat, Market, Şifre).");
            return;
        }

        // Şifre Kontrolü (Global Fonksiyon)
        const passCheck = window.validateComplexPassword(passInput.value);
        if (passCheck) { alert(passCheck); return; }

        if (!fileInput.files || fileInput.files.length === 0) {
            alert("HATA: Görsel yüklemek zorunludur.");
            return;
        }

        const fiyat = parseFloat(fiyatInput.value);
        const urunAdi = urunAdiInput.value;
        const barkod = barkodInput ? barkodInput.value.trim() : null;
        const marketAdi = marketAdiInput.value;
        const pass = passInput.value;
        const deleteToken = await sha256(pass);

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

        const rawFiles = Array.from(fileInput.files);
        const optimizedFiles = await Promise.all(rawFiles.map(file => optimizeImage(file)));
        const file = optimizedFiles[0];
        let publicUrl = null;

        const fileName = `kanit_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const { error: uploadError } = await window.supabase.storage
            .from('piyasa-kanitlar')
            .upload(fileName, file);

        if (uploadError) throw uploadError;
        const { data: urlData } = window.supabase.storage.from('piyasa-kanitlar').getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;

        const bugun = new Date().toLocaleDateString('tr-TR');

        /* >> PİYASA VERİ KAYIT MOTORU RESTORASYONU << */
        const { error: dbError } = await window.supabase.from('piyasa_verileri').insert([{
            urun_adi: urunAdi,
            fiyat: fiyat,
            barkod: barkod, 
            market_adi: marketAdi,
            image_url: publicUrl,
            delete_password: deleteToken // Eksik değişken eklendi, sistem ayağa kalktı
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
            .select('id,urun_adi,fiyat,market_adi,tarih_etiketi,image_url,is_active,created_at,barkod')
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log("Supabase Gelen:", tumVeriler);

        if (tumVeriler) {
            // SÜPER KONTROL V2: Sadece aktif olan ve 45 günden yeni verileri listele
            const today = new Date();
            const aktifVeriler = tumVeriler.filter(u => {
                return u.is_active === true;
            });

            window.PiyasaMotoru.listeOlustur(aktifVeriler, tumVeriler);
        }
    } catch (e) {
        console.error("Radar veri çekme hatası:", e.message);
        const container = document.getElementById('fiyat-dedektifi-listesi');
        if (container) container.innerHTML = `<p style="text-align:center; color:red;">Veriler yüklenemedi.</p>`;
    }
}

/* >> OTOMATİK SEMT ENFLASYON ANALİZİ (CANLI VERİDEN) << */
async function renderEnflasyonGrafigi() {
    const canvas = document.getElementById('enflasyonChart');
    if (!canvas) return;

    try {
        // MÜHÜRLENDİ: Boş tablo yerine gerçek 'piyasa_verileri' tablosunu süz
        const { data, error } = await window.supabase
            .from('piyasa_verileri')
            .select('fiyat, created_at')
            .eq('is_active', true)
            .order('created_at', { ascending: true });

        if (error || !data || data.length === 0) return;

        // Verileri tarihlere göre gruplayıp günlük ortalama fiyatı çıkar
        const gunlukAnaliz = {};
        data.forEach(item => {
            const tarih = new Date(item.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
            if (!gunlukAnaliz[tarih]) {
                gunlukAnaliz[tarih] = { toplam: 0, adet: 0 };
            }
            gunlukAnaliz[tarih].toplam += parseFloat(item.fiyat);
            gunlukAnaliz[tarih].adet += 1;
        });

        const etiketler = Object.keys(gunlukAnaliz);
        const ortalamaFiyatlar = etiketler.map(t => (gunlukAnaliz[t].toplam / gunlukAnaliz[t].adet).toFixed(2));

        // Eski grafiği bellekten temizle
        if (window.enflasyonChartInstance) window.enflasyonChartInstance.destroy();

        // Chart.js Çizimi (Cyber Pink Temalı)
        window.enflasyonChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: etiketler,
                datasets: [{
                    label: 'Semt Ortalaması (₺)',
                    data: ortalamaFiyatlar,
                    borderColor: '#ff007f', // cyber-pink
                    backgroundColor: 'rgba(255, 0, 127, 0.1)',
                    borderWidth: 3,
                    tension: 0.4, // Yumuşak kavisli hatlar
                    fill: true,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: false, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            }
        });
    } catch (err) {
        console.error("Grafik Motoru Hatası:", err);
    }
}