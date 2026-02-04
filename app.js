/* >> BAHÇELİEVLER PRO ENGINE V4.3 - %100 ARINDIRILMIŞ NİHAİ SÜRÜM << */
/* >> XSS GÜVENLİK FİLTRESİ (MÜHÜRLENDİ) << */
window.escapeHTML = function(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
};

/* >> KÜFÜR VE ARGO FİLTRELEME MOTORU (MÜHÜRLENDİ) << */
window.badWords = ['küfür1', 'küfür2', 'hakaret1', 'argo1', 'aptal', 'salak', 'gerizekalı', 'şerefsiz']; // Genişletilebilir liste
window.filterContent = function(text) { let cleanText = text; window.badWords.forEach(word => { const regex = new RegExp(word, 'gi'); cleanText = cleanText.replace(regex, '***'); }); return cleanText; };
window.hasBadWords = function(text) { return window.badWords.some(word => text.toLowerCase().includes(word.toLowerCase())); };

let slideIndex = 0;
let editingAdId = null;
let allAds = [];
let isProcessing = false;
let currentCategory = 'all'; 
window.currentAdId = null;
window.currentFirsatId = null;

/* >> GÜVENLİK MOTORU: SHA-256 HASH << */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* >> ŞİFRE DOĞRULAMA MOTORU (YENİ) << */
window.validateComplexPassword = function(password) {
    const errorMsg = "Şifre 1 harf ve 4 rakam olmalı (Örn: S1571). Aynı rakam 3 kez yan yana gelemez ve ardışık rakam (123) içeremez.";
    if (!password) return errorMsg;
    
    // 1. Format: 1 Harf + 4 Rakam (Toplam 5 Karakter)
    if (!/^[a-zA-Z]\d{4}$/.test(password)) return errorMsg;
    
    // 2. Tekrar: 3 aynı rakam yan yana (Örn: 111)
    if (/(.)\1{2}/.test(password)) return errorMsg;
    
    // 3. Ardışık: 3 sıralı rakam (Artan/Azalan - Örn: 123, 321)
    const d = password.slice(1).split('').map(Number);
    for (let i = 0; i < d.length - 2; i++) {
        if ((d[i] + 1 === d[i+1] && d[i+1] + 1 === d[i+2]) || (d[i] - 1 === d[i+1] && d[i+1] - 1 === d[i+2])) return errorMsg;
    }
    return null;
};

/* >> GÖRSEL OPTİMİZASYON MOTORU (STABİL) << */
async function optimizeImage(file) {
    if (!file) return null;
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const max_width = 1200; // Optimum genişlik
                let width = img.width;
                let height = img.height;

                if (width > max_width) {
                    height *= max_width / width;
                    width = max_width;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 0.7 kalitesi ile JPEG formatında sıkıştırıyoruz
                canvas.toBlob((blob) => {
                    const optimizedFile = new File([blob], file.name, { type: 'image/jpeg' });
                    resolve(optimizedFile);
                }, 'image/jpeg', 0.7);
            };
        };
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupForms();
    setupContactForm(); 
    setupQuoteForm(); 
    setupFirsatForm();
    setupKesintiForm(); 
    setupHizmetForm();  
    setupEstateForm();
    renderHizmetler();  
    setupAdSearch(); 
    loadPortalData();
    fetchLiveInfo();
    setInterval(fetchLiveInfo, 15 * 60 * 1000);
    initSlider();

    // Deep Linking: URL Hash Kontrolü
    const hash = window.location.hash;
    if (hash) {
        if (hash.startsWith('#ilan-')) {
            const id = hash.substring(6);
            const checkAds = setInterval(() => {
                if (allAds && allAds.length > 0) {
                    clearInterval(checkAds);
                    openAdDetail(id);
                }
            }, 200);
            setTimeout(() => clearInterval(checkAds), 10000);
        } else if (hash.startsWith('#firsat-')) {
            openFirsatDetail(hash.substring(8));
        }
    }
});

/* >> NAVİGASYON MOTORU: HİYERARŞİK TEMİZLİK V3.0 << */
function setupNavigation() {
    // Tüm navigasyon tetikleyicilerini (menü, butonlar, widgetlar) kapsar
    const navItems = document.querySelectorAll(".nav-item, [data-target], .cyber-btn-block, .home-widget");
    
    const handleNavigation = (e) => {
        const trigger = e.target.closest("[data-target]");
        if (!trigger) return;
        
        const target = trigger.getAttribute("data-target");

        // 1. TÜM GERÇEK SAYFA (SECTION.PAGE) ÖĞELERİNİ TEMİZLE [cite: 03-02-2026]
        // Bu adım, hiyerarşik olarak en üstteki sayfaları kesin olarak gizler.
        document.querySelectorAll("section.page").forEach(p => {
            p.classList.remove("active");
            p.style.setProperty('display', 'none', 'important');
        });

        // 2. HEDEF SAYFAYI MÜHÜRLE VE GÖSTER
        const targetPage = document.getElementById(target);
        if (targetPage) {
            // Statik akış için block mühürü vurulur (Flex çakışması önlenir) [cite: 03-02-2026]
            targetPage.style.setProperty('display', 'block', 'important');
            targetPage.classList.add("active");
            
            // Kullanıcıyı her zaman sayfa başına taşır
            window.scrollTo({ top: 0, behavior: 'instant' });
        }

        // 3. ANA SAYFA BİLEŞENLERİNİ YÖNET (SLIDER, HERO VB.)
        // Bu bileşenler sadece 'home' aktifken görünür olmalıdır.
        const homeComponents = [
            ".slider-container", ".home-hero", "#info-bar", 
            "#ramadan-status", "#gundem-haber", "#home-dashboard"
        ];
        
        homeComponents.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                // Ana sayfa dışındaki sayfalarda bu bileşenleri DOM'dan gizler [cite: 03-02-2026]
                el.style.display = (target === "home") ? "" : "none";
            }
        });

        // 4. ALT MENÜ İKONLARINI VE AKTİF DURUMU GÜNCELLE
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        const activeLink = document.querySelector(`.nav-item[data-target="${target}"]`);
        if (activeLink) activeLink.classList.add("active");
    };

    // Mevcut event listener'ları temizleyip yenilerini bağlar
    navItems.forEach(el => {
        el.removeEventListener('click', handleNavigation);
        el.addEventListener('click', handleNavigation);
    });
}

// --- 2. VERİ YÜKLEME MOTORU ---
async function loadPortalData() {
    try {
        // Önce temel verileri yükle
        await Promise.allSettled([
            fetchAndRenderAds(),
            renderTavsiyeler(),
            renderSikayetler(),
            renderFirsatlar(),
            fetchDuyurular(), // Duyuru Motoru Güncellendi
            renderKesintiler(),
            fetchHaberler(), // Haber Motoru Başlatıldı
        ]);

        // KRİTİK: Önce verileri çek, sonra grafiği oluştur
        await fetchAndRenderPiyasa(); 
        await renderEnflasyonGrafigi(); 

        updateDashboard();
    } catch (err) { console.error("Portal yükleme hatası:", err); }
}

async function fetchAndRenderPiyasa() {
    let attempts = 0;
    while (!window.PiyasaMotoru && attempts < 20) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    try {
        const { data, error } = await window.supabase
            .from('piyasa_verileri')
            .select('id, urun_adi, fiyat, market_adi, tarih_etiketi, image_url, is_active, created_at')
            .order('created_at', { ascending: false });

        if (!error && data && window.PiyasaMotoru) {
            // MÜHÜRLENDİ: Sadece aktif ve 45 günden yeni veriler listelenir.
            const today = new Date();
            const aktifVeriler = data.filter(u => {
                const recordDate = new Date(u.created_at);
                const ageInDays = (today - recordDate) / (1000 * 60 * 60 * 24);
                return u.is_active === true && ageInDays <= 45;
            });

            // Analiz için tüm veriler (data), listeleme için filtrelenmiş aktifVeriler kullanılır.
            window.PiyasaMotoru.listeOlustur(aktifVeriler, data);
        }
    } catch (e) { console.error("Piyasa Motoru Çevrimdışı"); }
}

// --- 3. SLIDER BAŞLATICI (TÜM TARAYICILARDA STABİL) ---
function initSlider() {
    const slides = document.getElementsByClassName("slider-item");
    if (!slides || slides.length === 0) return;

    // İlk açılışta tüm slide'ları sıfırla
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active-slide");
    }

    // İlk slide'ı göster
    slideIndex = 0;
    slides[0].classList.add("active-slide");

    // Döngüyü başlat
    slideIndex = 1;
    setTimeout(showSlides, 4000);
}


/* >> BOT KORUMA MOTORU << */
function isBotDetected(formId) {
    /* >> BOT KORUMA HARİTASI (TAM LİSTE) << */
    const hpMap = {
        "new-ad-form": "hp_ilan",
        "recommend-form": "hp_tavsiye",
        "complaint-form": "hp_sikayet",
        "quote-request-form": "hp_teklif",
        "piyasa-form": "hp_radar",
        "hizmet-form": "hp_hizmet",
        "firsat-form": "hp_firsat" // Eksik olan mühür eklendi
    };
    const hpField = document.getElementById(hpMap[formId]);
    if (hpField && hpField.value !== "") {
        console.warn("Süper Kontrol: Bot algılandı, işlem reddedildi.");
        return true;
    }
    return false;
}

/* >> TEKLİF ALMA SİSTEMİ MOTORU - SÜPER KONTROL V3.6 << */
async function setupQuoteForm() {
    const quoteForm = document.getElementById("quote-request-form");
    if (!quoteForm) return;

    quoteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isBotDetected("quote-request-form") || isProcessing) return; // BOT KONTROLÜ AKTİF

        const fileInput = document.getElementById("quote-file");
        const emailInput = document.getElementById("quote-email");
        const btn = document.getElementById("quote-submit-btn");

        // --- 3. SENARYO KONTROLÜ: E-POSTA FORMATI ---
        const emailValue = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            alert("HATA: Lütfen geçerli bir e-posta adresi yazınız (Örn: isim@mail.com)");
            emailInput.focus();
            return;
        }

        // SÜPER KONTROL: Dosya değişkeni tanımlandı
        const file = fileInput.files[0];
        if (!file) {
            alert("HATA: Lütfen arıza veya iş ile ilgili bir görsel ekleyiniz.");
            return;
        }

        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "İŞLENİYOR...";

        try {
            const fileName = `teklif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const { data, error: storageError } = await window.supabase.storage
                .from('ilanlar')
                .upload(fileName, file);
            
            if (storageError) throw storageError;
            
            const { data: urlData } = window.supabase.storage.from('ilanlar').getPublicUrl(fileName);
            const uploadedImageUrl = urlData.publicUrl;

            const payload = {
                category: document.getElementById("quote-category").value,
                talep_metni: document.getElementById("quote-text").value,
                email: emailValue,
                image_url: uploadedImageUrl
            };

            const { error: dbError } = await window.supabase.from('teklifal').insert([payload]);
            if (dbError) throw dbError;

            const emailParams = {
                name: `Teklif: ${payload.category}`,
                email: payload.email,
                message: `Talep Detayı: ${payload.talep_metni}\nGörsel: ${uploadedImageUrl}`,
                title: "Yeni Teklif Talebi"
            };
            await emailjs.send('service_hdlldav', 'template_1qzuj7s', emailParams);

            alert("Talebiniz bize ulaştı, en kısa sürede mail adresinize dönüş yapılacaktır.");
            
            quoteForm.reset();
            document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
            document.getElementById("hizmetler").classList.add("active");

        } catch (err) {
            alert("Sistem Hatası: " + err.message);
        } finally {
            isProcessing = false;
            btn.disabled = false;
            btn.textContent = "TEKLİF TALEBİ GÖNDER";
        }
    });
}

/* >> İLAN YAYINLAMA: KURALLAR DAHİLİNDE GÜNCEL << */
async function handleMultipleUploads(files) {
    if (!files || files.length === 0) return [];
    let urls = [];
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB LİMİTİ
    const filesArray = Array.from(files).slice(0, 4); // MAKSİMUM 4 ADET

    for (let file of filesArray) {
        if (file.size > MAX_SIZE) {
            alert(`"${file.name}" 10MB limitini aşıyor. Lütfen daha küçük bir dosya seçin.`);
            continue;
        }
        const fileExt = file.name.split('.').pop();
        const fileName = `ilan_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        try {
            const { data, error } = await window.supabase.storage
                .from('ilanlar')
                .upload(fileName, file);
            if (error) throw error;
            const { data: urlData } = window.supabase.storage.from('ilanlar').getPublicUrl(fileName);
            if (urlData) urls.push(urlData.publicUrl);
        } catch (err) {
            console.error("Yükleme hatası:", err.message);
        }
    }
    return urls;
}

window.handleAdEdit = async function(ad) {
    const pass = prompt("İlanı düzenlemek için şifrenizi girin:");
    if (!pass) return;
    
    const hash = await sha256(pass.trim());
    const { data } = await window.supabase.from('ilanlar').select('id').eq('id', ad.id).eq('delete_token', hash);
    
    if (data && data.length > 0) {
        editingAdId = ad.id;
        
        document.getElementById("ad-title").value = ad.title;
        document.getElementById("ad-price").value = ad.price;
        document.getElementById("ad-content").value = ad.content;
        document.getElementById("ad-category").value = ad.category;
        document.getElementById("ad-district").value = ad.district || 'Bahçelievler';
        document.getElementById("ad-contact").value = ad.contact;
        if(document.getElementById("ad-condition")) document.getElementById("ad-condition").value = ad.condition || '2.el';
        if(document.getElementById("ad-warranty")) document.getElementById("ad-warranty").value = ad.warranty || 'Yok';
        if(document.getElementById("ad-telegram")) document.getElementById("ad-telegram").value = ad.telegram_username || '';
        document.getElementById("ad-tc-no").value = pass.trim();
        
        closeModal();
        window.scrollToIlanForm();
        alert("Düzenleme modu aktif. Bilgileri güncelleyip 'YAYINLA' butonuna basınız.");
    } else {
        alert("Hata: Şifre yanlış!");
    }
};

function setupForms() {
    const adForm = document.getElementById("new-ad-form");
    if (adForm) {
        adForm.addEventListener("submit", async e => {
            e.preventDefault();
            if (isBotDetected("new-ad-form") || isProcessing) return;

            const titleVal = document.getElementById("ad-title").value;
            const priceVal = document.getElementById("ad-price").value;
            const contentVal = document.getElementById("ad-content").value;

            // >> KÜFÜR KONTROLÜ <<
            if (window.hasBadWords(titleVal) || window.hasBadWords(contentVal)) {
                alert('Lütfen topluluk kurallarına uygun bir dil kullanın.');
                return;
            }

            const fileInput = document.getElementById("ads-files");
            
            // Düzenleme modundaysak mevcut resimleri hafızaya al
            let existingImages = {};
            if (editingAdId) {
                const ad = allAds.find(a => a.id == editingAdId);
                if (ad) {
                    existingImages = {
                        image_url: ad.image_url,
                        image_url_2: ad.image_url_2,
                        image_url_3: ad.image_url_3
                    };
                }
            }

            if (!editingAdId && (!fileInput.files || fileInput.files.length === 0)) {
                alert("HATA: İlan yayınlamak için en az 1 adet fotoğraf yüklemek zorunludur!");
                return;
            }
            
            if (fileInput.files.length > 4) {
                alert("HATA: En fazla 4 adet fotoğraf seçebilirsiniz.");
                return;
            }
            
            if (contentVal.length > 350) {
                alert("HATA: Açıklama 350 karakteri geçemez.");
                return;
            }
            
            const safeRegex = /^[a-zA-Z0-9çĞİıÖşüÇğİıÖŞÜ\s\.\,\!\?\-\:\(\)\;\/]+$/;
            if (!safeRegex.test(contentVal)) {
                alert("HATA: Açıklamada geçersiz karakterler var.");
                return;
            }
            
            const titleRegex = /^[a-zA-Z0-9çĞİıÖşüÇğİıÖŞÜ\-\s]+$/;
            if (titleVal.length > 25 || !titleRegex.test(titleVal)) {
                alert("HATA: Başlık max 25 karakter olmalı.");
                return;
            }

            // SÜPER KONTROL: Şifreleme ve Token Motoru Devrede
            const passInput = document.getElementById("ad-tc-no");
            const rawPass = passInput.value.trim(); 
            
            const passCheck = window.validateComplexPassword(rawPass);
            if (passCheck) {
                alert(passCheck);
                return;
            }

            // 2. Token (Silme yetkisi için gizli anahtar - İşlem Güvenliği)
            const deleteToken = await sha256(rawPass);

            const btn = document.getElementById("ad-submit-button");
            isProcessing = true;
            btn.disabled = true;
            btn.textContent = "YAYINLA...";

            try {
                let urls = [];
                // Sadece yeni dosya seçildiyse yükleme yap
                if (fileInput.files.length > 0) {
                    const rawFiles = Array.from(fileInput.files);
                    const optimizedFiles = await Promise.all(rawFiles.map(file => optimizeImage(file)));
                    urls = await handleMultipleUploads(optimizedFiles);
                }

                // Veri objesini hazırla
                const adData = {
                    title: titleVal,
                    price: priceVal,
                    category: document.getElementById("ad-category").value,
                    district: document.getElementById("ad-district").value,
                    condition: document.getElementById("ad-condition")?.value || '2.el',
                    warranty: document.getElementById("ad-warranty")?.value || 'Yok',
                    telegram_username: document.getElementById("ad-telegram")?.value || '',
                    content: contentVal,
                    contact: document.getElementById("ad-contact").value,
                    delete_token: deleteToken,
                    is_active: true,
                    // Yeni resim yoksa mevcut (existingImages) linklerini kullan
                    image_url: urls[0] || existingImages.image_url || null,
                    image_url_2: urls[1] || existingImages.image_url_2 || null,
                    image_url_3: urls[2] || existingImages.image_url_3 || null
                };

                let error;
                if (editingAdId) {
                    // GÜNCELLEME MODU
                    const response = await window.supabase.from('ilanlar').update(adData).eq('id', editingAdId);
                    error = response.error;
                    if (!error) {
                        alert("İlan başarıyla güncellendi!");
                    }
                } else {
                    // YENİ İLAN MODU
                    const response = await window.supabase.from('ilanlar').insert([adData]);
                    error = response.error;
                    if (!error) alert("İlan yayınlandı!");
                }

                if (error) throw error;
                
                adForm.reset();
                loadPortalData();
                window.closeAddAdModal();
            } catch (err) {
                alert("Hata: " + err.message);
            } finally {
                isProcessing = false;
                btn.disabled = false;
                btn.textContent = "YAYINLA";
                editingAdId = null;
            }
        }); 
    }
}

/* >> TAVSİYE KAYIT MOTORU V5.0 - SÜPER KONTROL << */
document.getElementById("recommend-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isBotDetected("recommend-form") || isProcessing) return;

    const btn = e.target.querySelector('button');
    const titleVal = document.getElementById("rec-title").value.trim();
    const districtVal = document.getElementById("rec-district").value;
    const ratingVal = parseInt(document.getElementById("rec-rating").value);
    const contentVal = document.getElementById("rec-content").value;
    const passVal = document.getElementById("rec-pass").value;
    const fileInput = document.getElementById("rec-file");

    // 1. GÖRSEL ZORUNLULUĞU VE LİMİT KONTROLÜ
    if (!fileInput.files || fileInput.files.length === 0) return alert("HATA: En az 1 görsel eklemek zorunludur!");
    if (fileInput.files.length > 2) return alert("HATA: Maksimum 2 görsel seçebilirsiniz.");

    // 2. SEO VE KARAKTER FİLTRESİ (Mühür: Sadece harf, rakam ve noktalama)
    const safeRegex = /^[a-zA-Z0-9çĞİıÖşüÇğİıÖŞÜ\s\.\,\!\?\-\:\(\)\;]+$/;
    if (!safeRegex.test(contentVal)) return alert("HATA: Yorumda sadece harf, rakam ve temel noktalama işaretleri kullanabilirsiniz.");
    
    if (window.hasBadWords(titleVal) || window.hasBadWords(contentVal)) {
        return alert("Lütfen topluluk kurallarına uygun bir dil kullanın.");
    }

    const passCheck = window.validateComplexPassword(passVal);
    if (passCheck) return alert(passCheck);

    isProcessing = true;
    btn.disabled = true;
    btn.textContent = "İŞLENİYOR...";

    try {
        const optimizedFiles = await Promise.all(Array.from(fileInput.files).map(f => optimizeImage(f)));
        const urls = await handleMultipleUploads(optimizedFiles);
        const deleteToken = await sha256(passVal);

        const payload = {
            title: titleVal,
            comment: contentVal,
            rating: ratingVal,
            district: districtVal, // Yeni Mahalle Verisi
            delete_password: deleteToken,
            image_url: urls[0] || null,
            image_url_2: urls[1] || null,
            category: "Tavsiye"
        };

        const { error } = await window.supabase.from('tavsiyeler').insert([payload]);
        if (error) throw error;

        alert("Tavsiyeniz başarıyla panoya eklendi!");
        e.target.reset();
        loadPortalData();
    } catch (err) {
        alert("Hata: " + err.message);
    } finally {
        isProcessing = false;
        btn.disabled = false;
        btn.textContent = "PAYLAŞ";
    }
});


    document.getElementById("complaint-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        if (isBotDetected("complaint-form") || isProcessing) return; // BOT KONTROLÜ EKLENDİ
        
        const btn = document.getElementById("comp-submit-btn");
        const fileInput = document.getElementById("comp-files");
        const passVal = document.getElementById("comp-pass").value;

        // Şifre Kontrolü
        const passCheck = window.validateComplexPassword(passVal);
        if (passCheck) { alert(passCheck); return; }
        
        if (fileInput && fileInput.files.length > 2) {
            alert("En fazla 2 adet görsel ekleyebilirsiniz.");
            return;
        }

        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "İLETİLİYOR...";

        try {
            let urls = [];
            if (fileInput && fileInput.files.length > 0) {
                urls = await handleMultipleUploads(fileInput.files);
            }

            const deleteToken = await sha256(passVal);

            const payload = {
                title: document.getElementById("comp-title").value,
                content: document.getElementById("comp-content").value,
                delete_password: deleteToken,
                category: document.getElementById("comp-category") ? document.getElementById("comp-category").value : "Genel",
                image_url: urls[0] || null,
                image_url_2: urls[1] || null
            };

            const { error } = await window.supabase.from('sikayetler').insert([payload]);
            if (error) throw error;

            alert("Şikayet ve iyileştirme talebiniz halka açık panoda yayınlandı!");
            e.target.reset();
            loadPortalData();
        } catch (err) {
            alert("Hata: " + err.message);
        } finally {
            isProcessing = false;
            btn.disabled = false;
            btn.textContent = "BİLDİRİ YAYINLA";
        }
    });

/* >> FIRSAT ALANLARINI TETİKLEME MOTORU << */
function toggleFirsatFields() {
    const type = document.getElementById("firsat-type").value;
    const onlineDiv = document.getElementById("online-only");
    const dateArea = document.getElementById("firsat-date-area");
    const titleInput = document.getElementById("firsat-title");
    const descInput = document.getElementById("firsat-desc");
    const priceInput = document.getElementById("firsat-price");

    if (type === "yerel") {
        if (onlineDiv) onlineDiv.style.display = "none";
        if (dateArea) {
            dateArea.style.display = "block";
            document.getElementById("firsat-date").value = new Date().toISOString().split('T')[0];
        }
        titleInput.maxLength = 25;
        descInput.maxLength = 255;
    } else {
        if (onlineDiv) onlineDiv.style.display = "block";
        if (dateArea) dateArea.style.display = "none";
        titleInput.maxLength = 100;
        descInput.maxLength = 1000;
    }
	
	const label = document.getElementById("firsat-file-label");
    if (label) {
        if (type === "yerel") {
            label.innerHTML = '<i class="fas fa-camera"></i> RESİM EKLEMEK ZORUNLUDUR!';
            label.style.color = "#d32f2f"; 
        } else {
            label.innerHTML = '<i class="fas fa-camera"></i> Görsel Ekle (Opsiyonel)';
            label.style.color = "#666"; 
        }
    }
}

/* >> FIRSAT KAYIT MOTORU (GÜNCEL: FİYAT VE KESİN RESİM KONTROLLÜ) << */
async function setupFirsatForm() {
    const form = document.getElementById("firsat-form");
    if (!form) return;

    // Fırsat türü değiştiğinde alanları güncelle
    const typeSelect = document.getElementById("firsat-type");
    if (typeSelect) {
        typeSelect.addEventListener("change", toggleFirsatFields);
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isBotDetected() || isProcessing) return; // BOT KONTROLÜ EKLENDİ
        // Süper Kontrol: Form ID parametresi eklendi
        if (isBotDetected("firsat-form") || isProcessing) return;

        const type = document.getElementById("firsat-type").value;
        const title = document.getElementById("firsat-title").value;
        const priceInfo = document.getElementById("firsat-price").value;
        const desc = document.getElementById("firsat-desc").value;
        const link = document.getElementById("firsat-link").value;
        const pass = document.getElementById("firsat-pass").value;
        const fileInput = document.getElementById("firsat-files");
        const files = fileInput.files;

        // Şifre Kontrolü
        const passCheck = window.validateComplexPassword(pass);
        if (passCheck) { alert(passCheck); return; }

        if (type === "online") {
            if (!link) {
                alert("HATA: Online ürünler için Ürün Linki zorunludur!");
                return;
            }
        }

        if (type === "yerel") {
            if (files.length === 0) {
                alert("HATA: Yerel esnaf ilanları için en az 1 adet resim yüklemek zorunludur!");
                return;
            }
            if (!desc || desc.trim() === "") {
                alert("HATA: Yerel esnaf ilanları için Detay/Adres yazmak zorunludur!");
                return;
            }
            if (files.length > 2) return alert("HATA: Maksimum 2 görsel seçebilirsiniz.");
            
            const safeRegex = /^[a-zA-Z0-9çĞİıÖşüÇğİıÖŞÜ\s\.\,\!\?\-\:\(\)]+$/;
            if (!safeRegex.test(title) || !safeRegex.test(desc)) {
                return alert("HATA: Sadece harf, rakam ve noktalama işaretleri kullanın.");
            }
        }

        isProcessing = true;
        document.getElementById("firsat-submit-btn").textContent = "YÜKLENİYOR...";

        try {
            let urls = files.length > 0 ? await handleMultipleUploads(files) : [];
            const deleteToken = await sha256(pass);

            const payload = {
                title: title,
                content: desc ? `💰 FIRSAT: ${priceInfo}\n\n${desc}` : `💰 FIRSAT: ${priceInfo}`, 
                link: type === "online" ? link : null,
                category: type === 'yerel' ? 'Yerel Esnaf & Mağaza' : 'Online Ürün & Kampanya',
                image_url: urls[0] || null,
                image_url_2: urls[1] || null,
                delete_password: deleteToken,
                type: type
            };

            const { error } = await window.supabase.from('firsatlar').insert([payload]);
            if (error) throw error;

            alert("Paylaşım Başarılı!");
            form.reset();
            toggleFirsatFields();
            renderFirsatlar();
        } catch (err) {
            alert("Sistem Hatası: " + err.message);
        } finally {
            isProcessing = false;
            document.getElementById("firsat-submit-btn").textContent = "GÖNDER";
        }
    });
}
/* >> GARANTİLİ LOGO VE GÖRSEL BULUCU (MÜHÜRLÜ) << */
function getPlaceholderImage(link) {
    const safeFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";

    if (!link || link.trim() === "") return safeFallback;

    try {
        const urlObj = new URL(link);
        const domain = urlObj.hostname.replace('www.', '');
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
        return safeFallback;
    }
}

/* >> YENİLENMİŞ FIRSAT RENDER MOTORU << */
async function renderFirsatlar() {
    const el = document.getElementById('firsat-list');
    if (!el) return;
    const { data } = await window.supabase.from('firsatlar').select('*').order('created_at', {ascending: false});
    
    el.innerHTML = data?.map(f => {
        const displayImg = f.image_url || getPlaceholderImage(f.link);
        const isOnline = f.category === 'Online Ürün & Kampanya';
        const borderColor = isOnline ? '#007bff' : '#28a745';

        return `
        <div class="cyber-card ad-card" style="border-left: 6px solid ${borderColor}; padding: 15px;" onclick="openFirsatDetail('${f.id}')">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:0.65rem; font-weight:bold; text-transform:uppercase; background:#f0f4f8; color:#555; padding:4px 8px; border-radius:6px;">
                    ${window.escapeHTML(f.category)}
                </span>
                <button onclick="event.stopPropagation(); window.deleteFirsat('${f.id}')" style="background:none; border:none; color:#ff4d4d; cursor:pointer;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            
            <h4 style="margin:0 0 10px 0; font-size:1.1rem; color:var(--dark-text);">${window.escapeHTML(f.title)}</h4>
            
            <div style="width:100%; height:180px; background:#f9f9f9; border-radius:10px; overflow:hidden; margin-bottom:12px;">
                <img src="${displayImg}" style="width:100%; height:100%; object-fit:contain; padding:10px;">
            </div>

            <div style="background: #fdfdfd; padding: 10px; border-radius: 8px; border: 1px dashed #eee;">
                <p style="font-size:0.85rem; color:#444; line-height:1.4; margin:0;">
                    ${window.escapeHTML(f.content)}
                </p>
            </div>
        </div>`;
    }).join('') || "";
}

window.openFirsatDetail = async function(id) {
    try {
        const { data: f, error } = await window.supabase.from('firsatlar').select('*').eq('id', id).single();
        if (error || !f) return;
        window.currentFirsatId = f.id;

        const dateStr = new Date(f.created_at).toLocaleDateString('tr-TR', {day:'2-digit', month:'2-digit', year:'numeric'});

        document.getElementById("modal-title").textContent = f.title;
        /* >> MODAL META VERİ (KATEGORİ & TARİH) AYRIŞTIRMA MÜHÜRÜ << */

        // modal-price alanını temizleyip kurumsal meta alanına dönüştürür
        document.getElementById("modal-price").innerHTML = `
            <div class="modal-header-meta" style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 20px; width: 100%;">
                <span class="meta-badge" style="background: var(--azure-light); color: var(--app-blue); padding: 6px 15px; border-radius: 50px; font-weight: 800; font-size: 0.9rem; text-transform: uppercase; border: 1px solid rgba(0, 86, 179, 0.1);">
                    <i class="fas fa-tag"></i> ${window.escapeHTML(f.category)}
                </span>
                <span class="meta-date" style="color: #888; font-size: 0.85rem; font-weight: 600;">
                    <i class="far fa-calendar-alt"></i> ${dateStr}
                </span>
            </div>`;
        
        // Fırsat açıklama kutusunu ortalar ve kurumsallaştırır
        const descriptionEl = document.getElementById("modal-description");
        if (descriptionEl) {
            descriptionEl.innerText = f.content || '';
        }
        // Fırsat modalında iletişim alanı olmadığı için temizliyoruz
        const contactEl = document.getElementById('modal-contact');
        if(contactEl) contactEl.innerText = '';

        const gallery = document.getElementById("modal-image-gallery");
        if (gallery) {
            const images = [f.image_url, f.image_url_2].filter(Boolean);
            if (images.length > 0) {
                gallery.style.background = "#000"; 
                gallery.innerHTML = images.map(src => `<img src="${src}" style="width:100%; margin-bottom:12px; border-radius:10px;">`).join('');
            } else {
                gallery.style.background = "#f8f9fa"; 
                gallery.innerHTML = `<img src="${getPlaceholderImage(f.link)}" 
                    onerror="this.src='https://www.google.com/s2/favicons?domain=${f.link}&sz=128'"
                    style="width:auto; max-width:80%; max-height:150px; object-fit:contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));">`;
            }
        }

        const buyBtn = document.getElementById("modal-buy-btn");
        if (buyBtn) {
            if (f.link && f.link.trim() !== "") {
                buyBtn.style.display = "block";
                buyBtn.textContent = "FIRSATA GİT";
                
                // Link yönlendirme güvenliği
                const safeLink = f.link.startsWith('http') ? f.link : 'https://' + f.link;
                
                buyBtn.onclick = (e) => {
                    e.preventDefault();
                    window.open(safeLink, '_blank');
                };
            } else {
                buyBtn.textContent = "MAĞAZA BİLGİSİ";
                buyBtn.onclick = () => alert("Yerel esnaf fırsatıdır.");
            }

            // WhatsApp Paylaş Butonu Enjeksiyonu
            const oldShare = document.getElementById("modal-share-btn");
            if (oldShare) oldShare.remove();

            const shareBtn = document.createElement("button");
            shareBtn.id = "modal-share-btn";
            shareBtn.className = "cyber-submit";
            shareBtn.style.cssText = "background: #25D366 !important; margin-top: 5px; margin-bottom: 20px;";
            shareBtn.innerHTML = '<i class="fab fa-whatsapp"></i> PAYLAŞ';
            shareBtn.onclick = () => window.shareOnWhatsApp(f.title, 'firsat-' + f.id);
            
            buyBtn.style.marginBottom = "10px";
            buyBtn.after(shareBtn);
        }

        // Yorum Butonu Ayarı (Fırsat Modu)
        const commentBtn = document.querySelector('#comment-section button');
        if(commentBtn) {
            commentBtn.setAttribute('onclick', "window.sendComment('firsat')");
            commentBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ONAYA GÖNDER';
        }
        if (typeof window.loadComments === "function") window.loadComments(f.id, 'firsat');

        // Modalı ekranda göster
        const modal = document.getElementById("ad-detail-modal");
        if (modal) {
            modal.style.display = "flex";
            setTimeout(() => {
                modal.style.visibility = "visible";
                modal.style.opacity = "1";
            }, 10);
        }

    } catch (err) {
        console.error("Detay hatası:", err);
    }
};

/* >> DİĞER FONKSİYONLAR << */
async function renderTavsiyeler() {
    const el = document.getElementById('recommend-list');
    if (!el) return;
    const { data } = await window.supabase.from('tavsiyeler')
        .select('*')
        .or('is_active.is.null,is_active.eq.true')
        .order('created_at', { ascending: false });

    el.innerHTML = data?.map(item => `
        <div class="cyber-card" style="margin-bottom:15px; border-bottom:1px solid #eee; cursor:pointer;" onclick="window.openSocialDetail('tavsiyeler', '${item.id}')">
            <div style="display:flex; justify-content:space-between;">
                <strong>${window.escapeHTML(item.title)}</strong>
                <span>${"⭐".repeat(item.rating || 5)}</span>
            </div>
            ${item.image_url ? `<img src="${item.image_url}" style="width:100%; border-radius:8px; margin:10px 0; max-height:200px; object-fit:cover;">` : ''}
            <p style="margin:8px 0; font-style:italic;">"${window.escapeHTML(item.comment)}"</p>
        </div>
    `).join('') || "";
}

async function renderSikayetler() {
    const el = document.getElementById('complaint-list');
    if (!el) return;
    const { data } = await window.supabase.from('sikayetler')
        .select('*')
        .or('is_active.is.null,is_active.eq.true')
        .order('created_at', { ascending: false });
    
    el.innerHTML = data?.map(i => `
        <div class="cyber-card" style="margin-bottom:15px; border-left: 5px solid #ff4d4d; cursor:pointer;" onclick="window.openSocialDetail('sikayetler', '${i.id}')">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <span style="font-size:0.7rem; font-weight:bold; background:#ffebee; color:#c62828; padding:2px 6px; border-radius:4px;">${window.escapeHTML(i.category)}</span>
            </div>
            <h4 style="margin:10px 0 5px 0;">${window.escapeHTML(i.title)}</h4>
            <p style="font-size:0.9rem; color:#444;">${window.escapeHTML(i.content)}</p>
            <div style="display:flex; gap:5px; margin:10px 0;">
                ${i.image_url ? `<img src="${i.image_url}" style="width:48%; height:120px; object-fit:cover; border-radius:8px;">` : ''}
                ${i.image_url_2 ? `<img src="${i.image_url_2}" style="width:48%; height:120px; object-fit:cover; border-radius:8px;">` : ''}
            </div>
            <div style="text-align:right; font-size:0.6rem; color:#aaa;">${new Date(i.created_at).toLocaleDateString('tr-TR')}</div>
        </div>
    `).join('') || "";
}


// FIRSAT SİLME MOTORU - TİP ÇAKALIMINI BİTİREN VERSİYON
window.deleteFirsat = async (id) => {
    const userPass = prompt("Bu fırsatı silmek için lütfen şifrenizi girin:");
    if (!userPass || !userPass.trim()) return;

    const finalPass = String(userPass).trim();
    const deleteToken = await sha256(finalPass);

    const { data, error } = await window.supabase
        .from('firsatlar')
        .delete()
        .eq('id', id)
        .eq('delete_password', deleteToken)
        .select();

    if (error) {
        console.error("Supabase Hatası:", error);
        alert("Sistem Hatası: " + error.message);
        return;
    }

    if (data && data.length > 0) {
        alert("Fırsat başarıyla silindi.");
        if (typeof loadPortalData === "function") loadPortalData();
    } else {
        alert("Hata: Şifre yanlış!");
        console.warn("Eşleşme yok. DB'deki değer ile girilen şifrenin hash'i uyuşmuyor.");
    }
};

// TAVSİYE SİLME MOTORU
window.deleteTavsiye = async (id) => {
    const userPass = prompt("Bu tavsiyeyi silmek için şifrenizi girin:");
    if (!userPass || !userPass.trim()) return;
    const deleteToken = await sha256(userPass.trim());

    const { data, error } = await window.supabase
        .from('tavsiyeler')
        .delete()
        .eq('id', id)
        .eq('delete_password', deleteToken)
        .select();

    if (data && data.length > 0) {
        alert("Tavsiye başarıyla silindi.");
        loadPortalData();
    } else {
        alert("Hata: Girdiğiniz şifre yanlış.");
    }
};

window.deleteSikayet = async (id) => {
    const userPass = prompt("Bu şikayeti silmek için şifrenizi girin:");
    if (userPass === null || !userPass.trim()) return;
    const deleteToken = await sha256(userPass.trim());

    const { error } = await window.supabase
        .from('sikayetler')
        .delete()
        .eq('id', id)
        .eq('delete_password', deleteToken); 

    if (!error) {
        alert("Şikayet başarıyla kaldırıldı.");
        loadPortalData(); // Ekranda anında yok olmasını sağlar
    } else {
        alert("Hata: Girdiğiniz şifre yanlış.");
    }
};

async function fetchAndRenderAds() {
    const list = document.getElementById("ads-list");
    if (!list) return;
    const { data } = await window.supabase.from('ilanlar')
        .select('id, created_at, title, price, category, content, contact, image_url, image_url_2, image_url_3, telegram_username, condition, warranty, district')
        .or('is_active.is.null,is_active.eq.true')
        .order('created_at', {ascending: false});
    allAds = data || [];
    
    const searchInput = document.getElementById("ad-search-input");
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    applyFilters(currentCategory, searchTerm);
}

window.openAdDetail = function(id) {
    const ad = allAds.find(a => a.id == id);
    if (!ad) return;
    window.currentAdId = ad.id;

    // Yorum Butonu Ayarı (İlan Modu)
    const commentBtn = document.querySelector('#comment-section button');
    if(commentBtn) {
        commentBtn.setAttribute('onclick', "window.sendComment('ilan')");
        commentBtn.innerHTML = '<i class="fas fa-paper-plane"></i> YORUMU GÖNDER';
    }

    document.body.style.overflow = 'hidden'; // Arka plan kaydırmasını engelle

    const adDate = new Date(ad.created_at).toLocaleDateString('tr-TR');
    document.getElementById("modal-title").innerHTML = `<div style='display:flex; justify-content:space-between; font-size:0.8rem; color:#888; margin-bottom:5px;'><span>#${ad.id.toString().slice(-5)}</span><span>${adDate}</span></div>${window.escapeHTML(ad.title)}`;
    
    // İlan Detayına Durum ve Garanti Rozetleri
    const existingBadges = document.getElementById("ad-badges-row");
    if (existingBadges) existingBadges.remove();

    const detailInfo = `
    <div id="ad-badges-row" style="display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap;">
        <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">${window.escapeHTML(ad.category)}</span>
        <span style="background: #e3f2fd; color: #0056b3; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">${window.escapeHTML(ad.condition || '2.el')}</span>
        <span style="background: #f0f4f8; color: #666; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">Garanti: ${window.escapeHTML(ad.warranty || 'Yok')}</span>
        <span style="background: #fff3e0; color: #e65100; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;"><i class='fas fa-map-marker-alt'></i> ${window.escapeHTML(ad.district || 'Bahçelievler')}</span>
    </div>`;
    document.getElementById("modal-title").insertAdjacentHTML('afterend', detailInfo);

    document.getElementById("modal-price").textContent = `Fiyat: ${new Intl.NumberFormat('tr-TR').format(ad.price)} TL`;

    const content = ad.content || '';
    const contact = ad.contact || '';

    document.getElementById('modal-description').innerText = content;
    const contactEl = document.getElementById('modal-contact');
    if (contact) {
        contactEl.innerText = `İletişim: ${contact}`;
    } else {
        contactEl.innerText = '';
    }

    const gallery = document.getElementById("modal-image-gallery");
    if (gallery) {
        // Galeri her açıldığında başa sar
        gallery.scrollLeft = 0;

        const images = [ad.image_url, ad.image_url_2, ad.image_url_3].filter(Boolean);

        gallery.innerHTML = images.length
            ? images.map(src => `<img src="${src}" alt="İlan görseli" style="width: 100%; border-radius: 8px; margin-bottom: 10px;">`).join('')
            : '<p style="text-align: center; color: #888; padding: 20px 0;">Bu ilan için görsel mevcut değil.</p>';
    }

    // SÜPER KONTROL: TELEGRAM YÖNLENDİRME MOTORU
    const buyBtn = document.getElementById("modal-buy-btn");
    if (buyBtn) {
        buyBtn.textContent = "TELEGRAM İLE SOR";
        buyBtn.onclick = () => {
            const tgUser = ad.telegram_username || "BahcelievlerForumDestek"; 
            const msg = encodeURIComponent("Merhaba, " + ad.title + " ilanınız için yazıyorum.");
            window.open("https://t.me/" + tgUser + "?text=" + msg, '_blank');
        };
    }

    if (buyBtn) {
       const oldShare = document.getElementById("modal-share-btn");
        if (oldShare) oldShare.remove();

        const shareBtn = document.createElement("button");
        shareBtn.id = "modal-share-btn";
        shareBtn.className = "cyber-submit";
        shareBtn.style.cssText = "background: #25D366 !important; margin-top: 5px; margin-bottom: 20px;";
        shareBtn.innerHTML = '<i class="fab fa-whatsapp"></i> PAYLAŞ';
        shareBtn.onclick = () => window.shareOnWhatsApp(ad.title, 'ilan-' + ad.id);
        
        buyBtn.style.marginBottom = "10px";
        buyBtn.after(shareBtn);
    }

    // >> YORUM SİSTEMİ ENTEGRASYONU <<
    if (typeof window.loadComments === "function") window.loadComments(ad.id, 'ilan');

    // MODERN DÜZENLEME BUTONU VE GÜVENLİ YERLEŞİM
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn-style';
    editBtn.style.width = '100%';
    editBtn.style.height = '50px';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> BU İLANI DÜZENLE';
    editBtn.onclick = () => window.handleAdEdit(ad);

    const footer = document.querySelector('.modal-footer'); 
    if (footer) { 
        footer.innerHTML = ''; // Eski butonları temizle 
        // Eski admin butonlarını temizle (Buy/Share butonlarını koru)
        const oldAdminBtns = footer.querySelectorAll('.edit-btn-style, .delete-btn-style');
        oldAdminBtns.forEach(b => b.remove());
        
        // İstenen mühür: prepend
        footer.prepend(editBtn); 

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn-style';
        deleteBtn.id = 'modal-delete-btn-inner';
        deleteBtn.style.width = '100%';
        deleteBtn.style.height = '50px';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> İlanı Kalıcı Olarak Kaldır';
        deleteBtn.onclick = () => window.deleteAd(ad.id);
        footer.appendChild(deleteBtn);
    }

    const modal = document.getElementById("ad-detail-modal");
    if (modal) {
        modal.style.display = "flex";
        setTimeout(() => {
            modal.style.visibility = "visible";
            modal.style.opacity = "1";
        }, 10);
    }
};

const closeModal = () => {
    const modal = document.getElementById("ad-detail-modal");
    if (modal) {
        modal.style.display = "none";
        modal.style.opacity = "0";
        modal.style.visibility = "hidden";
        document.body.style.overflow = 'auto'; // Sayfa donmasını engeller
    }
};

const closeBtn = document.querySelector(".close-detail");
if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
    }, { passive: false });
    
    closeBtn.addEventListener("touchend", (e) => {
        e.preventDefault();
        closeModal();
    }, { passive: false });
}

const modalElement = document.getElementById("ad-detail-modal");
if (modalElement) {
    modalElement.addEventListener("click", (e) => {
        if (e.target.id === "ad-detail-modal") {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        }
    }, { passive: false });
    
    modalElement.addEventListener("touchend", (e) => {
        if (e.target.id === "ad-detail-modal") {
            e.preventDefault();
            closeModal();
        }
    }, { passive: false });
}

async function updateDashboard() {
    try {
        const { data: lastAd } = await window.supabase.from('ilanlar').select('title').order('created_at', {ascending: false}).limit(1);
        if (lastAd?.[0]) document.getElementById("preview-ad").textContent = lastAd[0].title;

        const { data: lastKesinti } = await window.supabase.from('kesintiler').select('location, type').order('created_at', {ascending: false}).limit(1);
        const kesintiEl = document.getElementById("preview-kesinti");
        if (kesintiEl) {
            kesintiEl.textContent = lastKesinti?.[0] ? `${lastKesinti[0].type}: ${lastKesinti[0].location}` : "Aktif kesinti yok.";
        }

      const { data: lastPiyasa } = await window.supabase
    .from('piyasa_verileri')
    .select('id,urun_adi,fiyat,market_adi,tarih_etiketi,image_url,is_active,created_at,barkod')
    .order('created_at', {ascending: false})
    .limit(1);

if (lastPiyasa?.[0]) {
            const previewPiyasa = document.getElementById("preview-piyasa");
            if (previewPiyasa) {
                // Yazıyı güncelle ve ortala
                previewPiyasa.innerHTML = `${window.escapeHTML(lastPiyasa[0].urun_adi)}<br><span style="color:var(--cyber-pink);">${window.escapeHTML(String(lastPiyasa[0].fiyat))} TL</span> <small style="color:#888;">@${window.escapeHTML(lastPiyasa[0].market_adi)}</small>`;
                previewPiyasa.style.width = "100%";
                previewPiyasa.style.textAlign = "center";
            }

            // SÜPER KONTROL: index.html'deki GERÇEK ID'yi hedefliyoruz
            const actualImg = document.getElementById("piyasa-img"); 
            if (actualImg) {
                actualImg.remove(); // Kareyi HTML'den söküp atar
            }
        }

        const { data: lastFirsat } = await window.supabase.from('firsatlar').select('title').order('created_at', {ascending: false}).limit(1);
        if (lastFirsat?.[0]) document.getElementById("preview-firsat").textContent = lastFirsat[0].title;

        const { data: lastTavsiye } = await window.supabase.from('tavsiyeler').select('title').order('created_at', {ascending: false}).limit(1);
        const previewTavsiye = document.getElementById("preview-tavsiye");
        if (previewTavsiye) previewTavsiye.textContent = lastTavsiye?.[0] ? lastTavsiye[0].title : "Henüz tavsiye yok.";

        const { data: lastSikayet } = await window.supabase.from('sikayetler').select('title').order('created_at', {ascending: false}).limit(1);
        const previewSikayet = document.getElementById("preview-sikayet");
        if (previewSikayet) previewSikayet.textContent = lastSikayet?.[0] ? lastSikayet[0].title : "Aktif bildirim yok.";

    } catch (err) {
        console.error("Dashboard güncelleme motoru durdu:", err.message);
    }
}

function showSlides() {
    let slides = document.getElementsByClassName("slider-item");
    if (!slides || slides.length === 0) return;
    
    // 3. Mevcut tüm aktif sınıfları ve görünürlüğü sıfırla
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active-slide");
        slides[i].style.display = "none";
    }
    
    // 4. İndeks kontrolü
    if (slideIndex >= slides.length) slideIndex = 0;
    
    const currentSlide = slides[slideIndex];
    if (currentSlide) {
        // 5. Önce blok akışına al, sonra reflow tetikle
        currentSlide.style.display = "block";
        
        // Görselin siyah kalmasını önleyen kritik teknik mühür (Reflow)
        void currentSlide.offsetWidth; 
        
        currentSlide.classList.add("active-slide");
    }
    
    slideIndex++;
    // 6. Bir sonraki geçişi mühürle
    window.sliderTimeout = setTimeout(showSlides, 4000);
}

/* >> DUYURU MOTORU: RESMİ BİLGİ AKIŞI << */
async function fetchDuyurular() {
    const previewEl = document.getElementById('preview-duyuru'); 
    const listEl = document.getElementById('duyuru-list'); 

    const { data, error } = await window.supabase
        .from('duyurular')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Duyuru çekme hatası:", error.message);
        return;
    }

    // İsim Kontrolü: Duyurular için 'baslik' ve 'icerik' öncelikli
    if (previewEl && data.length > 0) {
        previewEl.textContent = data[0].baslik || data[0].title || "Duyuru";
    }

    if (listEl) {
        listEl.innerHTML = data.map(d => {
            const baslik = d.baslik || d.title || "Duyuru";
            const icerik = d.icerik || d.content || "";
            const ozet = icerik.length > 120 ? icerik.substring(0, 120) + "..." : icerik;
            return `
            <div class="cyber-card" style="margin-bottom:15px; border-left: 5px solid #ff007f; cursor:pointer;" onclick="openHaberDetail('${d.id}', 'duyuru')">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <small style="color:#888;">${new Date(d.created_at).toLocaleDateString('tr-TR')}</small>
                    <i class="fas fa-bullhorn" style="color:#ff007f;"></i>
                </div>
                <h3 style="margin:10px 0 5px 0; color:var(--dark);">${window.escapeHTML(baslik)}</h3>
                <p style="font-size:0.9rem; color:#444; line-height:1.4;">${window.escapeHTML(ozet)}</p>
            </div>
        `}).join('') || "<p style='text-align:center; padding:20px;'>Aktif duyuru bulunmuyor.</p>";
    }
}

/* >> KESİNTİ BİLDİRİM MOTORU V4.1 << */
async function setupKesintiForm() {
    const form = document.getElementById("kesinti-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isProcessing) return; 

        const typeVal = document.getElementById("kes-type").value;
        const providerVal = document.getElementById("kes-provider").value.trim(); // Yeni Alan
        const districtVal = document.getElementById("kes-district").value;
        const streetVal = document.getElementById("kes-street").value.trim();
        const descVal = document.getElementById("kes-desc").value.trim();
        const passVal = document.getElementById("kes-pass").value;

        // >> KÜFÜR VE ARGO DENETİMİ <<
        // Firma ismi, sokak ve detaylarda filtreleme yapılır
        if (window.hasBadWords(descVal) || window.hasBadWords(streetVal) || window.hasBadWords(providerVal)) {
            alert("Lütfen topluluk kurallarına uygun bir dil kullanın.");
            return;
        }
        
        const passCheck = window.validateComplexPassword(passVal);
        if (passCheck) { alert(passCheck); return; }

        const btn = document.getElementById("kes-submit-btn");
        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "BİLDİRİLİYOR...";

        try {
            const deleteToken = await sha256(passVal);
            const payload = {
                type: typeVal,
                location: `${districtVal}, ${streetVal}`, 
                // Firma bilgisi detayın başına kurumsal bir şekilde eklenir
                description: `[SAĞLAYICI: ${providerVal}] - ${descVal}`,
                delete_password: deleteToken
            };

            const { error } = await window.supabase.from('kesintiler').insert([payload]);
            if (error) throw error;

            alert("Kesinti bildirimi yayınlandı!");
            form.reset();
            if (typeof renderKesintiler === "function") renderKesintiler(); 
        } catch (err) {
            alert("Sistem Hatası: " + err.message);
        } finally {
            isProcessing = false;
            btn.disabled = false;
            btn.textContent = "BİLDİRİM GÖNDER";
        }
    });
}

/* >> GÜVENLİ KESİNTİ RENDER MOTORU << */
async function renderKesintiler() {
    const el = document.getElementById('kesinti-list');
    if (!el) return;

    const { data } = await window.supabase.from('kesintiler').select('*').order('created_at', { ascending: false });

    el.innerHTML = data?.map(k => `
        <div class="cyber-card" style="margin-bottom:12px; border-left: 5px solid ${k.type === 'Elektrik' ? '#ffc107' : k.type === 'Su' ? '#00d2ff' : '#ff4d4d'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:${k.type === 'Elektrik' ? '#b8860b' : '#007bff'};">${window.escapeHTML(k.type)} Kesintisi</strong>
                <button onclick="deleteKesinti('${k.id}')" style="background:none; border:none; color:#ccc;"><i class="fas fa-trash"></i></button>
            </div>
            <p style="margin:5px 0; font-weight:bold; font-size:0.9rem;"><i class="fas fa-map-marker-alt"></i> ${window.escapeHTML(k.location)}</p>
            <p style="margin:0; font-size:0.85rem; color:#555;">${window.escapeHTML(k.description)}</p>
            <div style="text-align:right; font-size:0.6rem; color:#999; margin-top:5px;">${new Date(k.created_at).toLocaleTimeString('tr-TR')}</div>
        </div>
    `).join('') || "<p style='text-align:center;'>Şu an bildirilmiş bir kesinti yok.</p>";
}

/* >> GÜVENLİ KESİNTİ SİLME MOTORU << */
window.deleteKesinti = async (id) => {
    const userPass = prompt("Silmek için şifre:");
    if (!userPass) return;
    const deleteToken = await sha256(userPass.trim());

    // Şifreyi client-side karşılaştırmak yerine Supabase sorgusuna dahil ediyoruz
    const { data, error } = await window.supabase
        .from('kesintiler')
        .delete()
        .eq('id', id)
        .eq('delete_password', deleteToken)
        .select();

    if (data && data.length > 0) {
        alert("Bildirim başarıyla silindi.");
        renderKesintiler();
    } else {
        alert("Hata: Şifre yanlış!");
    }
};

window.showLegal = function(type) {
    if (type === 'emlak-kvkk') {
        const kvkkContent = `
            <div style="text-align:left; font-size:0.85rem; line-height:1.5; color:#333;">
                <h3 style="text-align:center; color:var(--app-blue); border-bottom:1px solid #eee; padding-bottom:10px;">🛡️ EMLAK TALEP KVKK</h3>
                <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında; bu form aracılığıyla paylaştığım kişisel verilerimin (telefon numarası, arama tercihlerim ve talep bilgilerim), Bahçelievler ilçesinde faaliyet gösteren emlak ofisleri ile paylaşılmasını, tarafıma gayrimenkul taleplerim doğrultusunda iletişime geçilmesini kabul ediyorum. Kişisel verilerimin yalnızca bu amaçla işleneceğini, üçüncü kişilerle izinsiz paylaşılmayacağını ve talebim halinde silineceğini biliyorum.</p>
            </div>`;
        
        const legalModalContent = document.getElementById('legal-modal-content');
        const legalModal = document.getElementById('legal-modal');
        
        if (legalModalContent && legalModal) {
            legalModalContent.innerHTML = kvkkContent;
            legalModal.style.display = 'flex';
            setTimeout(() => {
                legalModal.style.visibility = 'visible';
                legalModal.style.opacity = '1';
            }, 10);
        }
        return;
    }
    const area = document.getElementById('legal-content-area');
    const contents = {
     about: `
    <div style="text-align:left; font-size:0.9rem; line-height:1.5; color:#333;">
        <h3 style="text-align:center; border-bottom:1px solid #eee; padding-bottom:10px;">🎓 HAKKIMIZDA</h3>
        
        <p><b>Bahçelievler Forum</b>, ilçemizin dijital dönüşümüne öncülük eden, mahalle kültürünü modern teknoloji ile birleştiren bağımsız bir yerel medya ve hizmet platformudur.</p>

        <p>Amacımız; Bahçelievler sakinlerinin ilanlarını tek merkezde toplamak, yerel esnafın dijital dünyada daha görünür olmasını sağlamak ve semt içi ticareti canlandırmaktır. Platformumuz; güncel mahalle duyurularından fiyat radarına, esnaf tanıtımlarından şikayet hatlarına kadar geniş bir yelpazede hizmet sunmaktadır.</p>

        <p><b>Vizyonumuz:</b> Bahçelievler’in en kapsamlı dijital rehberi ve yerel ekonomi merkezi olmak. Kullanıcılarımıza sunduğumuz yenilikçi çözümlerle, semt içi etkileşimi en üst düzeye çıkarmayı hedefliyoruz.</p>

        <p style="margin-top:15px; font-weight:bold; color:var(--app-blue);">Bahçelievler Forum, yerel dinamikleri teknolojiyle buluşturan bir girişim projesidir.</p>
    </div>
        `,
disclaimer: `
    <div style="text-align:left; font-size:0.8rem; line-height:1.4; color:#333; padding:5px;">
        <h3 style="text-align:center; color:#d32f2f; border-bottom:1px solid #eee; padding-bottom:10px;">⚖️ KULLANIM KOŞULLARI VE SORUMLULUK REDDİ</h3>
        
        <p><b>1. İÇERİK SORUMLULUĞU:</b> Platformda yayınlanan her türlü ilan, yorum, şikayet, tavsiye ve görselin içeriğinden doğrudan paylaşımı yapan kullanıcı sorumludur. <b>Bahçelievler Forum</b>, paylaşılan bilgilerin güncelliğini, doğruluğunu veya kalitesini garanti etmez. T.C. kanunlarına aykırı, hakaret içeren veya yanıltıcı paylaşımlardan doğacak hukuki sorumluluk tamamen kullanıcıya aittir.</p>

        <p><b>2. TİCARİ İLİŞKİLER VE ALIŞVERİŞ:</b> Kullanıcılar arasında gerçekleşen ürün satışı, hizmet alımı, pazarlık veya randevularda <b>Bahçelievler Forum</b> taraf değildir. Gerçekleşebilecek maddi kayıp, kusurlu ürün, dolandırıcılık veya manevi zararlardan platformumuz hiçbir şekilde sorumlu tutulamaz. Alışverişlerinizi güvenli alanlarda yapmanız önerilir.</p>

        <p><b>3. FİYAT RADARI (DEDEKTİFİ):</b> "Fiyat Dedektifi" bölümünde paylaşılan etiket ve fiyat verileri kullanıcı beyanıdır. Marketlerin anlık fiyat değişikliği yapma hakkı saklıdır. Bu veriler bilgilendirme amaçlı olup, mağaza ile yaşanacak fiyat uyuşmazlıklarında platformumuz sorumluluk kabul etmez.</p>

        <p><b>4. HİZMET KALİTESİ VE TEKLİFLER:</b> "Teklif Al" sistemi üzerinden yönlendirilen esnafların iş kalitesi, zamanlaması veya fiyatlandırması üzerinde platformumuzun bir denetimi yoktur. Hizmet sağlayıcı ile kullanıcı arasındaki sözleşme serbestliği esastır; yaşanacak teknik veya hukuki ihtilaflarda platformumuz arabulucu veya taraf değildir.</p>

        <p><b>5. TELİF HAKLARI:</b> Kullanıcılar, yükledikleri görsellerin kendilerine ait olduğunu veya kullanım hakkına sahip olduklarını taahhüt ederler. Başkasına ait görsel kullanımı nedeniyle oluşabilecek telif hakkı ihlallerinden ilgili kullanıcı doğrudan sorumlu tutulacaktır.</p>

        <p><b>6. HİZMET KESİNTİSİ:</b> Teknik güncellemeler, siber saldırılar veya servis sağlayıcı kaynaklı kesintiler nedeniyle platforma erişilememesi durumunda oluşabilecek veri kayıplarından platform yönetimi sorumlu değildir.</p>

        <p><b>7. DIŞ BAĞLANTILAR:</b> Sitede yer alan üçüncü taraf linkleri (Oyunlar, ISP haritaları vb.) harici servislerdir. Bu sitelerin içeriklerinden, güvenlik politikalarından ve veri toplama pratiklerinden sorumlu değiliz.</p>

        <p style="font-size:0.7rem; color:#d32f2f; font-weight:bold; border-top:1px solid #eee; padding-top:10px; margin-top:10px;"><i>Bahçelievler Forum platformunu kullanan tüm ziyaretçiler, bu şartları peşinen kabul etmiş sayılır. Yönetim, bu metni dilediği zaman güncelleme hakkını saklı tutar.</i></p>
    </div>
        `,
        kvkk: `
    <div style="text-align:left; font-size:0.8rem; line-height:1.4; color:#333; padding:5px;">
        <h3 style="text-align:center; color:#000; border-bottom:1px solid #eee; padding-bottom:10px;">🛡️ KVKK AYDINLATMA METNİ</h3>
        
        <p><b>1. VERİ SORUMLUSU:</b> 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla <b>Bahçelievler Forum Mahalle Platformu</b> (“Platform”) tarafından aşağıda açıklanan kapsamda işlenmektedir.</p>

        <p><b>2. İŞLENEN KİŞİSEL VERİ KATEGORİLERİ:</b> Platform tarafından kullanıcılarımıza ait;
            <ul>
                <li><b>Kimlik ve İletişim:</b> E-posta adresi, (belirtilmesi halinde) Ad-Soyad.</li>
                <li><b>İşlem Güvenliği:</b> IP adresi, 4 haneli içerik silme şifresi, giriş-çıkış log kayıtları.</li>
                <li><b>Lokasyon Verisi:</b> İlan, kesinti ve şikayet formlarında kullanıcı tarafından manuel beyan edilen mahalle/sokak/konum bilgileri.</li>
                <li><b>Görsel Veriler:</b> Formlara yüklenen etiket, arıza, hizmet veya mekan fotoğrafları.</li>
            </ul>
        </p>

        <p><b>3. VERİ İŞLEME AMAÇLARI VE HUKUKİ SEBEPLER:</b> Verileriniz, KVKK’nın 5. ve 6. maddelerinde belirtilen; 
            <i>"Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması"</i> ve <i>"Veri sorumlusunun meşru menfaatleri"</i> hukuki sebeplerine dayanarak;
            <ul>
                <li>İlan, şikayet ve hizmet tanıtımlarının doğrulanması ve yayına alınması,</li>
                <li>"Teklif Al" sistemi üzerinden kullanıcı taleplerinin hizmet sağlayıcılara iletilmesi,</li>
                <li>Platform güvenliğinin sağlanması ve suistimallerin önlenmesi,</li>
                <li>Resmi kurumlarca talep edilen yasal bildirimlerin yapılması amacıyla işlenmektedir.</li>
            </ul>
        </p>

        <p><b>4. VERİLERİN AKTARIMI VE SAKLANMASI:</b> Kişisel verileriniz, bulut tabanlı yüksek güvenlikli Supabase altyapısında saklanmakta olup; ticari amaçlarla üçüncü taraflara <b>asla satılmamaktadır.</b> Verileriniz yalnızca yasal zorunluluk hallerinde yetkili kamu kurumları ve adli makamlar ile paylaşılabilecektir.</p>

        <p><b>5. VERİ SİLME VE UNUTULMA HAKKI:</b> Kullanıcı, kendi belirlediği silme şifresi ile paylaştığı veriyi dilediği an sistemden kalıcı olarak temizleme hakkına sahiptir. Bu işlem gerçekleştirildiğinde veriler veri tabanımızdan geri döndürülemeyecek şekilde silinir.</p>

        <p><b>6. İLGİLİ KİŞİNİN HAKLARI:</b> Kanun’un 11. maddesi kapsamında; verilerinizin işlenip işlenmediğini öğrenme, yanlış verilerin düzeltilmesini isteme ve verilerinizin silinmesini talep etme haklarınız saklıdır. Taleplerinizi "Bize Yazın" sekmesinden iletebilirsiniz.</p>

        <p style="font-size:0.7rem; color:#888; border-top:1px solid #eee; padding-top:10px; margin-top:10px;"><i>Bu aydınlatma metni, platformun kullanımı ile eş zamanlı olarak yürürlüğe girmiş kabul edilir.</i></p>
    </div>
        `,
        sss: `
    <h3>❓ Sıkça Sorulan Sorular</h3>
    <div style="margin-top:10px; text-align:left; font-size:0.85rem; line-height:1.5;">
        
        <p><b>1. Paylaştığım içeriği (İlan, Fırsat, Şikayet vb.) nasıl silebilirim?</b><br>
        Paylaşım yaparken belirlediğiniz 4 haneli "Silme Şifresi" sizin anahtarınızdır. İçeriğinizin altındaki "SİL" butonuna basıp bu şifreyi girdiğinizde, verileriniz hem ekrandan hem de veri tabanımızdan kalıcı olarak silinir.</p>
        <hr style="opacity:0.1; margin:10px 0;">

        <p><b>2. Şifremi unuttum, içeriği sildirmek istiyorum?</b><br>
        Güvenlik nedeniyle şifreleri biz dahi göremiyoruz. Ancak içeriği paylaşırken kullandığınız e-posta adresi üzerinden "Bize Yazın" kısmından talep gönderirseniz, manuel kontrol sonrası silme işlemini yönetim gerçekleştirebilir.</p>
        <hr style="opacity:0.1; margin:10px 0;">

        <p><b>3. "Fiyat Dedektifi / Radar" nedir?</b><br>
        Bu bir sosyal dayanışma projesidir. Marketlerde gördüğünüz fiyatları etiket fotoğrafı ile bildirerek, tüm mahallenin en uygun ürünü nerede bulacağını görmesini sağlarsınız. Gerçek zamanlı veri analizi ile fahiş fiyat artışlarını takip etmemizi sağlar.</p>
        <hr style="opacity:0.1; margin:10px 0;">

        <p><b>4. Platformda reklam vermek veya işletmemi öne çıkarmak istiyorum?</b><br>
        İşletmenizin mahalle sakinlerine daha hızlı ulaşması için ana sayfa widget alanlarında veya ilan listelerinde "Sponsorlu" içerik olarak yer alabilirsiniz. Detaylı reklam tarifesi için "Bize Yazın" bölümünden iletişim bilgilerinizi bırakın.</p>
        <hr style="opacity:0.1; margin:10px 0;">

        <p><b>5. "Ücretsiz Teklif Al" sistemi güvenli mi?</b><br>
        Evet. Talebiniz sadece Bahçelievler bölgesinde referansı olan, doğrulanmış esnaflara iletilir. Esnaflar size e-posta yoluyla teklif sunar. Bahçelievler Forum, taraflar arasındaki ticari pazarlığa karışmaz, sadece köprü kurar.</p>
        <hr style="opacity:0.1; margin:10px 0;">

        <p><b>6. Şikayet bildirirken nelere dikkat etmeliyim?</b><br>
        Şikayetlerin yapıcı bir dille yazılması zorunludur. Hakaret, küfür veya asılsız karalama içeren içerikler yayınlanmaz. Sorunu somutlaştırmak için fotoğraf eklemeniz, çözüm sürecini hızlandıracaktır.</p>
        <hr style="opacity:0.1; margin:10px 0;">

        <p><b>7. İlanım neden onaylanmadı veya silindi?</b><br>
        Yanıltıcı fiyat içeren, yasal olmayan ürün satışı yapılan, iletişim bilgisi hatalı olan veya 4'ten fazla fotoğraf yüklenmeye çalışılan ilanlar sistem tarafından otomatik olarak reddedilmiş olabilir.</p>
        <hr style="opacity:0.1; margin:10px 0;">

        <p><b>8. Mahalle Duyuruları kısmında kimler paylaşım yapabilir?</b><br>
        Duyurular bölümü resmi kurumlar, mahalle muhtarlıkları ve Bahçelievler Forum yönetimi tarafından güncellenir. Önemli bir mahalle duyurunuz varsa yönetime iletebilirsiniz.</p>
        <hr style="opacity:0.1; margin:10px 0;">

        <p><b>9. Kişisel verilerim 3. şahıslarla paylaşılıyor mu?</b><br>
        KVKK politikamız gereği e-posta ve iletişim bilgileriniz asla satılmaz. Verileriniz sadece sizin rızanızla (ilanlarda görünecek şekilde) veya yasal zorunluluk hallerinde yetkili makamlarla paylaşılır.</p>
        <hr style="opacity:0.1; margin:10px 0;">

        <p><b>10. Bahçelievler Forum bir belediye uygulaması mı?</b><br>
        Hayır. Bu platform Bahçelievler sakinleri tarafından oluşturulmuş bağımsız bir mahalle rehberidir ve tamamen gönüllülük/yerel ticaret odaklı çalışır.</p>
    </div>
        `,
        'contact-info': `
            <h3>💬 Bize Yazın</h3>
            <p>Soru, öneri veya veri silme talepleriniz için aşağıdaki formu doldurabilirsiniz:</p>
            <form id="contact-form" class="cyber-form">
                <input type="text" id="contact-name" placeholder="Ad Soyad" required>
                <input type="email" id="contact-email" placeholder="E-posta" required>
                <textarea id="contact-info-form" placeholder="Mesajınız..." rows="3" required></textarea>
                <button type="submit" id="contact-submit-btn" class="cyber-submit" style="background:#007bff !important;">GÖNDER</button>
            </form>
        `
    };
    
    if(area) {
        area.innerHTML = contents[type];
        if(type === 'contact-info') {
            setupContactForm();
        }
    }
};

function setupContactForm() {
    const form = document.getElementById('contact-form');
    if(!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isBotDetected() || isProcessing) return; // BOT KONTROLÜ EKLENDİ
        
        const btn = document.getElementById("contact-submit-btn");
        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "GÖNDERİLİYOR...";

        const params = { 
            name: document.getElementById("contact-name").value, 
            email: document.getElementById("contact-email").value, 
            message: document.getElementById("contact-info-form").value, 
            title: "Genel İletişim" 
        };

        emailjs.send('service_hdlldav', 'template_1qzuj7s', params)
            .then(() => { 
                alert('Mesajınız başarıyla iletildi! En kısa sürede dönüş yapılacaktır.');
                form.reset(); 
            })
            .catch((err) => alert("Hata: " + err.text))
            .finally(() => { 
                isProcessing = false; 
                btn.disabled = false; 
                btn.textContent = "GÖNDER"; 
            });
    });
}

async function fetchLiveInfo() {
    try {
        const wRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=41.00&longitude=28.84&current_weather=true");
        const wData = await wRes.json();
        const temp = Math.round(wData.current_weather.temperature);
        document.getElementById("weather-temp").textContent = `Bahçelievler: ${temp}°C`;
    } catch (e) { document.getElementById("weather-temp").textContent = "Hava: --"; }

    try {
        const simpleRes = await fetch("https://open.er-api.com/v6/latest/USD");
        const sData = await simpleRes.json();
        
        const usdToTry = (sData.rates.TRY).toFixed(2);
        const eurToTry = (sData.rates.TRY / sData.rates.EUR).toFixed(2);

        document.getElementById("usd-rate").textContent = usdToTry + " ₺";
        document.getElementById("eur-rate").textContent = eurToTry + " ₺";
    } catch (e) { console.error("Kur çekilemedi"); }
}

function setupAdSearch() {
    const searchInput = document.getElementById("ad-search-input");
    if (!searchInput) return;
    
    searchInput.addEventListener("input", (e) => {
        applyFilters(currentCategory, e.target.value.trim());
    });
    
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    });
}

// YENİ: İlanları ekrana basan render fonksiyonu
window.renderAds = async function(ads) {
    const list = document.getElementById("ads-list");
    if (!list) return;
    
    if (ads.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <p style="font-size: 1rem; font-weight: bold;">Aradığınız kriterlere uygun ilan bulunamadı.</p>
                <p style="font-size: 0.85rem; margin-top: 5px;">Farklı bir arama terimi veya kategori deneyin.</p>
            </div>
        `;
    } else {
        const adsHtml = await Promise.all(ads.map(async ad => {
            const { count } = await window.supabase
                .from('ilan_yorumlar')
                .select('*', { count: 'exact', head: true })
                .eq('ilan_id', ad.id);

            const commentCount = count || 0;
            const adDate = new Date(ad.created_at).toLocaleDateString('tr-TR');
            return `
            <div class="ad-card cyber-card" onclick="openAdDetail('${ad.id}')">
                <img src="${ad.image_url || 'https://via.placeholder.com/300'}">
                <div style="padding: 10px;">
                    <div style="font-weight: 800; font-size: 1.1rem; color: #212529;">${new Intl.NumberFormat('tr-TR').format(ad.price)} TL</div>
                    <div style="font-size: 0.85rem; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 4px 0;">${window.escapeHTML(ad.title)}</div>
                    <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #f0f0f0;">
                        <div style="font-size: 0.75rem; color: #555; display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                            <i class="fas fa-map-marker-alt" style="color: #888;"></i> Bahçelievler
                        </div>
                        <div style="font-size: 0.65rem; color: #aaa; font-weight: 500;">
                            ${adDate}
                        </div>
                        <div style="font-size: 0.7rem; color: var(--app-blue); font-weight: 700; margin-top: 3px;">
                            <i class='far fa-comment-dots'></i> ${commentCount} Yorum
                        </div>
                    </div>
                </div>
            </div>
        `}));
        list.innerHTML = adsHtml.join('');
    }
};

/* >> TÜRKÇE KARAKTER UYUMLU FİLTRE MOTORU << */
async function applyFilters(category, searchTerm) {
    let filtered = allAds.filter(ad => {
        const matchesCategory = category === 'all' || ad.category === category;
        // toLocaleLowerCase('tr-TR') kullanarak Türkçe karakter sorununu mühürlüyoruz
        const searchLower = (searchTerm || "").toLocaleLowerCase('tr-TR');
        const adTitleLower = (ad.title || "").toLocaleLowerCase('tr-TR');
        const adContentLower = (ad.content || "").toLocaleLowerCase('tr-TR');
        
        const matchesSearch = adTitleLower.includes(searchLower) || adContentLower.includes(searchLower);
        return matchesCategory && matchesSearch;
    });
    
    renderAds(filtered);
}

window.filterAds = function(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (btn) {
        btn.classList.add('active');
    }
    
    currentCategory = category;
    const searchInput = document.getElementById("ad-search-input");
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    if (category === 'latest') {
        // İlanları tarihe göre (yeni -> eski) sırala
        const sortedAds = [...allAds].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        renderAds(sortedAds); 
    } else {
        applyFilters(category, searchTerm);
    }
};

window.searchOnMap = function() {
    const query = document.getElementById('map-search-input').value;
    if (!query) return alert("Lütfen aramak istediğiniz usta türünü yazın.");
    
    const mapIframe = document.getElementById('target-map');
    const freeSearchUrl = `https://www.google.com/search?q=https://maps.google.com/maps%3Fq%3D${encodeURIComponent(query)}+Bahçelievler+İstanbul&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    
    mapIframe.src = freeSearchUrl;
};


/* >> EMLAK TALEP MOTORU V3.0: AD-SOYAD ENTEGRASYONU << */
async function setupEstateForm() {
    const form = document.getElementById("estate-request-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isProcessing) return;

        // KVKK Onay Kontrolü
        const kvkkCheck = document.getElementById("est-kvkk");
        if (!kvkkCheck || !kvkkCheck.checked) {
            alert("Devam etmek için KVKK ve açık rıza metnini onaylamanız gerekmektedir.");
            return;
        }

        const name = document.getElementById("est-name").value.trim(); // Yeni Alan
        const phone = document.getElementById("est-phone").value.trim();
        const email = document.getElementById("est-email") ? document.getElementById("est-email").value.trim() : null;
        const desc = document.getElementById("est-desc").value.trim();

        // Küfür Filtresi (İsim ve Açıklama İçin)
        if (window.hasBadWords(desc) || window.hasBadWords(name)) {
            alert("Lütfen topluluk kurallarına uygun bir dil kullanın.");
            return;
        }

        const btn = document.getElementById("est-submit-btn");
        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "İŞLENİYOR...";

        try {
            const payload = {
                name: name, // Yeni Sütun
                type: document.getElementById("est-type").value,
                status: document.getElementById("est-status").value,
                district: document.getElementById("est-district").value,
                budget: document.getElementById("est-budget").value,
                description: desc,
                phone: phone, // Zorunlu
                email: email || null // Opsiyonel
            };

            const { error } = await window.supabase.from('emlak_talepleri').insert([payload]);
            if (error) throw error;

            alert("Talebiniz başarıyla emlak havuzuna mühürlendi!");
            form.reset();
            // Sayfa geçişini tetikle
            if (document.querySelector('[data-target="hizmetler"]')) {
                document.querySelector('[data-target="hizmetler"]').click();
            }
        } catch (err) {
            alert("Sistem Hatası: " + err.message);
        } finally {
            isProcessing = false;
            btn.disabled = false;
            btn.textContent = "TALEBİ HAVUZA GÖNDER";
        }
    });
}

/* >> HİZMET TANITIM MOTORU V3.0 (HATASIZ NİHAİ SÜRÜM) << */
async function setupHizmetForm() {
    const form = document.getElementById("hizmet-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Tek seferlik tanımlama (Redeclare hatasını önler)
        const btn = document.getElementById("hizmet-submit-btn");
        if (isBotDetected("hizmet-form") || isProcessing) return; // BOT KONTROLÜ EKLENDİ

        const titleVal = document.getElementById("hizmet-firma").value.trim();
        const descVal = document.getElementById("hizmet-desc").value.trim();
        const passVal = document.getElementById("hizmet-pass").value.trim();
        const fileInput = document.getElementById("hizmet-file");

        // Küfür ve Argo Kontrolü
        if (window.hasBadWords(titleVal) || window.hasBadWords(descVal)) {
            alert("Lütfen topluluk kurallarına uygun bir dil kullanın.");
            return;
        }

        // Şifre ve Dosya Sayısı Kontrolü
        const passCheck = window.validateComplexPassword(passVal);
        if (passCheck) { alert(passCheck); return; }
        if (fileInput.files.length > 2) { alert("Maksimum 2 görsel seçebilirsiniz."); return; }

        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "İŞLENİYOR...";

        try {
            // Görsel Optimizasyonu ve Yükleme
            const rawFiles = Array.from(fileInput.files);
            const optimizedFiles = await Promise.all(rawFiles.map(f => optimizeImage(f)));
            const urls = await handleMultipleUploads(optimizedFiles);
            const deleteToken = await sha256(passVal);

            const payload = {
                category: document.getElementById("hizmet-category").value,
                title: titleVal,
                location_name: document.getElementById("hizmet-konum").value,
                phone: document.getElementById("hizmet-tel").value,
                website: document.getElementById("hizmet-web").value || null,
                content: descVal,
                image_url: urls[0] || null,
                image_url_2: urls[1] || null,
                delete_password: deleteToken,
                created_at: new Date().toISOString() // Otomatik Tarih Mühürü
            };

            const { error } = await window.supabase.from('hizmetler').insert([payload]);
            if (error) throw error;

            alert("Hizmetiniz başarıyla eklendi!");
            form.reset();
            if (typeof renderHizmetler === "function") renderHizmetler();
        } catch (err) {
            alert("Sistem Hatası: " + err.message);
        } finally {
            isProcessing = false;
            btn.disabled = false;
            btn.textContent = "HİZMETİ YAYINLA";
        }
    });
}

// Hizmetlerin Modal Olarak Açılması
window.openHizmetDetail = function(id) {
    window.openSocialDetail('hizmetler', id); // Mevcut modal motorunu kullanır
};

async function renderHizmetler() {
    const el = document.getElementById('hizmet-list');
    if (!el) return;

    const { data } = await window.supabase.from('hizmetler')
        .select('*')
        .or('is_active.is.null,is_active.eq.true')
        .order('created_at', { ascending: false });

    el.innerHTML = data?.map(h => `
        <div class="cyber-card" style="margin-bottom:15px; border-left: 5px solid #28a745; cursor:pointer;" onclick="window.openSocialDetail('hizmetler', '${h.id}')">
        <div class="cyber-card" style="margin-bottom:15px; border-left: 5px solid #28a745; cursor:pointer;" onclick="window.openHizmetDetail('${h.id}')">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="student-badge" style="background:#e8f5e9; color:#2e7d32;">${window.escapeHTML(h.category)}</span>
                ${h.location_name ? `<small style="color:#666; font-size:0.75rem;"><i class="fas fa-map-marker-alt"></i> ${window.escapeHTML(h.location_name)}</small>` : ''}
            </div>
            <h3 style="margin:10px 0 5px 0;">${window.escapeHTML(h.title)}</h3>
            ${h.image_url ? `<img src="${h.image_url}" style="width:100%; border-radius:8px; margin:8px 0;">` : ''}
            <p style="font-size:0.9rem; color:#444;">${window.escapeHTML(h.content)}</p>
            ${h.phone ? `<div style="margin-top:8px; font-weight:bold; color:#28a745; font-size:0.9rem;"><i class="fas fa-phone"></i> ${window.escapeHTML(h.phone)}</div>` : ''}
            ${h.website ? `<div style="margin-top:4px; font-size:0.85rem;"><a href="${h.website}" target="_blank" onclick="event.stopPropagation()" style="color:#007bff; text-decoration:none;">🌐 Web Sitesi</a></div>` : ''}
        </div>
    `).join('') || "<p style='text-align:center;'>Henüz bir hizmet tanıtımı yok.</p>";
}

window.deleteHizmet = async (id, correctPass) => {
    const userPass = prompt("Silmek için şifrenizi girin:");
    if (!userPass || !userPass.trim()) return;

    const { error } = await window.supabase
        .from('hizmetler')
        .delete()
        .eq('id', id)
        .eq('delete_password', userPass); 

    if (!error) {
        alert("Hizmet başarıyla kaldırıldı.");
        loadPortalData(); // SÜPER KONTROL: Tüm portal verilerini ve dashboard'u senkronize yeniler
    } else {
        alert("Hata: Şifre yanlış!");
    }
};
/* >> MERKEZİ İLAN SİLME MOTORU - RLS UYUMLU << */
window.deleteAd = async (id) => {
    const userPass = prompt("İlanı kaldırmak için Silme Şifresini girin (Örn: S1571):");
    if (!userPass || !userPass.trim()) return;
    
    const rawInput = userPass.trim();
    const tokenHash = await sha256(rawInput);

    const { data, error } = await window.supabase
        .from('ilanlar')
        .update({ is_active: false })
        .eq('id', id)
        .eq('delete_token', tokenHash)
        .select();

    if (error) {
        alert("Sistem Hatası: " + error.message);
    } else if (data && data.length > 0) {
        alert("İlan başarıyla kaldırıldı.");
        if (typeof closeModal === "function") closeModal(); 
        loadPortalData(); 
    } else {
        alert("Hata: Şifre yanlış veya bu ilanı silme yetkiniz yok.");
    }
};

/* >> RADAR ÖZEL MODAL MOTORU << */
window.openRadarDetail = async function(id) {
    try {
        // 1. Mükerrer .from() hatası temizlendi
        const { data: urun, error } = await window.supabase
            .from('piyasa_verileri')
            .select('*')
            .eq('id', id)
            .single();
    if (error || !urun) return;
    // 2. HTML Elementlerini Güvenli Doldur
    document.getElementById("radar-title").textContent = urun.urun_adi;
    document.getElementById("radar-price").textContent = urun.fiyat + " TL";
    document.getElementById("radar-image-gallery").innerHTML = `<img src="${urun.image_url}" style="width:100%; border-radius:12px;">`;
    
    document.getElementById("radar-info-content").innerHTML = `
    <div class="ad-info-box">
        <p style="margin-bottom:8px; display:flex; align-items:center; gap:8px;"><strong><i class="fas fa-store"></i> Market:</strong> ${window.escapeHTML(urun.market_adi)}</p>
        <p style="margin:0; display:flex; align-items:center; gap:8px;"><strong><i class="fas fa-calendar-alt"></i> Tarih:</strong> ${urun.tarih_etiketi || 'Belirtilmedi'}</p>
    </div>`;
    // 3. Silme Butonunu Bağla
    document.getElementById("radar-delete-btn").onclick = () => window.softDeleteRadar(urun.id);
    // 4. Modalı Fiziksel Olarak Tetikle
    const modal = document.getElementById("radar-detail-modal");
    modal.style.display = "flex";
    setTimeout(() => { 
        modal.style.visibility = "visible";
        modal.style.opacity = "1"; 
    }, 10);
} catch (err) { console.error("Radar Hatası:", err); }
};

window.closeRadarModal = () => {
    const modal = document.getElementById("radar-detail-modal");
    if (modal) {
        modal.style.opacity = "0";
        setTimeout(() => { modal.style.display = "none"; }, 200);
    }
};

/* >> VERİ TOPLAMA ODAKLI SİLME (SOFT DELETE) - STABİLİZE EDİLDİ << */
window.softDeleteRadar = async (id) => {
    const userPass = prompt("İlanı kaldırmak için şifrenizi giriniz (1 Harf + 4 Rakam)");
    if (!userPass || !userPass.trim()) return;

    const finalPass = String(userPass).trim();
    const deleteToken = await sha256(finalPass);

    // Şifre Formatı Kontrolü (Mühür)
    const passCheck = window.validateComplexPassword(finalPass);
    if (passCheck) { alert(passCheck); return; }

    const { data, error } = await window.supabase
        .from('piyasa_verileri')
        .update({ is_active: false })
        .eq('id', id)
        .eq('delete_password', deleteToken)
        .select();

    if (error) {
        alert("Sistem Hatası: " + error.message);
    } else if (data && data.length > 0) {
        alert("Radar panodan kaldırıldı (Veri analiz için saklandı).");
        if (typeof window.closeRadarModal === "function") window.closeRadarModal();
        if (typeof loadPortalData === "function") loadPortalData(); 
    } else {
        alert("Hata: Şifre yanlış!");
    }
};

function validateTC(tc) {
    if (tc.length !== 11 || isNaN(tc) || tc[0] === '0' || /^(\d)\1{10}$/.test(tc)) return false;
    let digits = tc.split('').map(Number);
    let sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    let sum2 = digits[1] + digits[3] + digits[5] + digits[7];
    if ((sum1 * 7 - sum2) % 10 !== digits[9]) return false;
    if ((digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10 !== digits[10]) return false;
    return true;
}

window.scrollToIlanForm = function() {
    window.openAddAdModal();
    setTimeout(() => { document.getElementById('ad-title')?.focus(); }, 300);
};

window.openAddAdModal = function() {
    const modal = document.getElementById('add-ad-modal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
        }, 10);
    }
    document.getElementById('add-ad-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeAddAdModal = function() {
    const modal = document.getElementById('add-ad-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
    document.getElementById('add-ad-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
};

/* >> HABER MOTORU (GÜNDEM & HABER) << */
async function fetchHaberler() {
    const el = document.getElementById('haber-listesi');
    if (!el) return;

    try {
        const { data, error } = await window.supabase
            .from('haberler')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(6);

        if (error) throw error;
        renderHaberler(data);
    } catch (err) {
        console.error("Haber akışı hatası:", err);
        el.innerHTML = '<p style="text-align:center; width:100%; color:#888;">Haberler yüklenemedi.</p>';
    }
}

function renderHaberler(haberler) {
    const el = document.getElementById('haber-listesi');
    if (!el) return;

    if (!haberler || haberler.length === 0) {
        el.innerHTML = '<p style="text-align:center; width:100%; color:#888;">Henüz haber girişi yapılmamış.</p>';
        return;
    }

    el.innerHTML = haberler.map(h => {
        const img = h.image_url || 'https://via.placeholder.com/400x200?text=Bahcelievler+Haber';
        // İsim Kontrolü: Haberler için 'title' ve 'content' öncelikli
        const ozet = (h.content || h.icerik || h.ozet || '').substring(0, 100) + '...';
        const baslik = h.title || h.baslik || 'Bahçelievler Haber';
        
        return `
        <div class="cyber-card haber-card" onclick="openHaberDetail('${h.id}', 'haber')">
            <img src="${img}">
            <div class="haber-card-content">
                <h4>${window.escapeHTML(baslik)}</h4>
                <p>${window.escapeHTML(ozet)}</p>
            </div>
        </div>`;
    }).join('');
}

/* >> SEO: GOOGLE NEWS SCHEMA MOTORU << */
function generateStructuredData(h) {
    const scriptId = 'dynamic-news-schema';
    let script = document.getElementById(scriptId);
    if (script) script.remove();

    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';

    const schema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": h.baslik || h.title || 'Bahçelievler Haber',
        "image": [ h.image_url || 'https://via.placeholder.com/1200x675' ],
        "datePublished": h.created_at || new Date().toISOString(),
        "author": { "@type": "Organization", "name": "Bahçelievler Forum" }
    };

    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}

/* >> HABER DETAY MOTORU - REFERANS GÜNCELLEME V2 << */
window.openHaberDetail = async function(id, type = 'haber') {
    // Kilit Kırma: Sayfa kaydırmayı dondur (Kullanıcı etkileşimi için şart)
    document.body.style.overflow = 'hidden'; 

    const isDuyuru = type === 'duyuru';
    const tableName = isDuyuru ? 'duyurular' : 'haberler';
    const labelHtml = isDuyuru 
        ? '<span style="display:block; font-size:0.75rem; color:#ff007f; font-weight:bold; margin-bottom:5px; letter-spacing:1px;">📢 RESMİ DUYURU</span>' 
        : '<span style="display:block; font-size:0.75rem; color:#0056b3; font-weight:bold; margin-bottom:5px; letter-spacing:1px;">📰 SEMT HABERİ</span>';

    try {
        const { data: h, error } = await window.supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error || !h) {
            console.error("Haber bulunamadı:", error);
            document.body.style.overflow = 'auto'; // Hata durumunda kilidi aç
            return;
        }

        // SEO MÜHÜRLERİ: Dinamik Başlık ve Meta Açıklama
        const seoTitle = h.baslik || h.title || 'Bahçelievler Haber';
        document.title = seoTitle;

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            const seoContent = (h.ozet || h.icerik || h.content || '').substring(0, 160);
            metaDesc.setAttribute('content', seoContent);
        }

        // SEO: Schema.org verisini bas
        generateStructuredData(h);

        const modal = document.getElementById('haber-detail-modal');
        const modalImage = document.getElementById('haber-modal-image');
        
        if (modalImage) {
            if (h.image_url) {
                modalImage.style.display = 'block';
                // Görsel yüklenene kadar bir yer tutucu (placeholder) ayarları
                modalImage.style.backgroundColor = '#f0f4f8'; 
                modalImage.style.minHeight = '200px'; 
                
                modalImage.onload = () => {
                    modalImage.style.backgroundColor = '';
                    modalImage.style.minHeight = '';
                };
                modalImage.onerror = () => {
                    modalImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                };
                modalImage.src = h.image_url;
            } else {
                modalImage.style.display = 'none';
            }
        }

        // 1. MADDE GÜNCELLEMESİ: Undefined ve İçerik Kontrolü
        if (document.getElementById('haber-modal-title')) {
            const rawTitle = h.baslik || h.title || (isDuyuru ? 'Duyuru Detayı' : 'Bahçelievler Haber');
            document.getElementById('haber-modal-title').innerHTML = labelHtml + rawTitle;
        }

        if (document.getElementById('haber-modal-content')) {
            // Hem 'icerik' hem 'content' sütunlarını tarar, boşsa hata vermez
            const icerik = h.icerik || h.content || '';
            document.getElementById('haber-modal-content').innerHTML = icerik.replace(/\n/g, '<br>');
        }

        if (modal) {
            // Modal'ı görünür yap ve hiyerarşiyi tetikle
            modal.style.display = 'flex';
            // CSS transition varsaOpacity ve Visibility tetikle
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
            }, 10);
        }
    } catch (err) { 
        console.error("Portal Hatası:", err);
        document.body.style.overflow = 'auto'; // Kritik hata durumunda kilit kırma
    }
};

/* >> HABER MODAL KAPATMA MOTORU << */
window.closeHaberModal = function() {
    document.title = 'Bahçelievler Forum';
    
    const schemaScript = document.getElementById('dynamic-news-schema');
    if (schemaScript) schemaScript.remove();

    document.body.style.overflow = 'auto'; 
    const modal = document.getElementById('haber-detail-modal');
    if (modal) {
        modal.style.display = 'none';
        const img = document.getElementById('haber-modal-image');
        if (img) img.src = ''; 
    }
};

/* >> YASAL BİLGİ MODAL MOTORU << */
window.openLegalModal = function(type) {
    const modal = document.getElementById('legal-modal');
    const contentEl = document.getElementById('legal-modal-content');
    
    // İçerikler showLegal fonksiyonundan alınmıştır
    const contents = {
        'kvkk': `
            <div style="text-align:left; font-size:0.8rem; line-height:1.4; color:#333; padding:5px;">
                <h3 style="text-align:center; color:#000; border-bottom:1px solid #eee; padding-bottom:10px;">🛡️ KVKK AYDINLATMA METNİ</h3>
                <p><b>1. VERİ SORUMLUSU:</b> 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla <b>Bahçelievler Forum</b> tarafından işlenmektedir.</p>
                <p><b>2. İŞLENEN VERİLER:</b> E-posta, IP adresi, konum bilgisi ve yüklenen görseller.</p>
                <p><b>3. AMAÇLAR:</b> İlan doğrulama, güvenlik sağlama ve yasal bildirimler.</p>
                <p><b>4. HAKLARINIZ:</b> Verilerinizi silme ve bilgi alma hakkına sahipsiniz.</p>
                <p style="font-size:0.7rem; color:#888; margin-top:10px;"><i>Detaylı metin için İletişim sayfasını ziyaret ediniz.</i></p>
            </div>`,
        'disclaimer': `
            <div style="text-align:left; font-size:0.8rem; line-height:1.4; color:#333; padding:5px;">
                <h3 style="text-align:center; color:#d32f2f; border-bottom:1px solid #eee; padding-bottom:10px;">⚖️ KULLANIM KOŞULLARI</h3>
                <p><b>1. SORUMLULUK REDDİ:</b> Platformda yayınlanan ilan ve içeriklerden kullanıcılar sorumludur. Bahçelievler Forum doğruluk garantisi vermez.</p>
                <p><b>2. TİCARET:</b> Alışverişlerde oluşabilecek zararlardan platform sorumlu değildir.</p>
                <p><b>3. GÜVENLİK:</b> Kişisel şifrelerinizi kimseyle paylaşmayınız.</p>
                <p style="font-size:0.7rem; color:#d32f2f; font-weight:bold; margin-top:10px;"><i>Siteyi kullanan herkes bu şartları kabul etmiş sayılır.</i></p>
            </div>`
    };

    if(contents[type]) {
        contentEl.innerHTML = contents[type];
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
        }, 10);
    }
};

window.closeLegalModal = function() {
    const modal = document.getElementById('legal-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
};

/* >> SOSYAL PAYLAŞIM MOTORU << */
window.shareOnWhatsApp = function(title, path) {
    const siteUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${siteUrl}#${path}`; // URL hash kullanarak hedefi belirtiyoruz
    const message = `*${title}*\n\nDetaylar için Bahçelievler Forum'u ziyaret et:\n${shareUrl}`;
    
    // Eğer tarayıcı yerel paylaşımı destekliyorsa (Mobil cihazlar)
    if (navigator.share) {
        navigator.share({
            title: title,
            text: message,
            url: shareUrl
        }).catch(err => console.log('Paylaşım iptal edildi.'));
    } else {
        // Masaüstü veya desteklemeyen tarayıcılar için doğrudan WhatsApp
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    }
};

/* >> HİZMET DETAYLARINI MODALDA GÖSTERME VE KAYIT GÜNCELLEMESİ << */
/* >> MODAL BUTON HİYERARŞİSİ VE PAYLAŞIM MÜHÜRÜ << */
window.currentDetailTable = null;

/* >> HİZMET PAYLAŞIM VE METİN MÜHÜRÜ << */

window.shareHizmet = function(id, title) {
    // URL oluşturma mantığı Invalid URL hatasını önlemek için mühürlendi
    const siteUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${siteUrl}?hizmet=${id}`;
    const message = `*${title}*\n\nBahçelievler Forum'da harika bir hizmet buldum! Detaylar için:\n${shareUrl}`;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: message,
            url: shareUrl
        }).catch(err => console.log('Paylaşım iptal edildi veya hata oluştu.'));
    } else {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    }
};

window.prepareDeleteHizmet = async function(id) {
    const table = window.currentDetailTable || 'hizmetler';
    const userPass = prompt("İçeriği kaldırmak için şifrenizi giriniz:");
    if (!userPass || !userPass.trim()) return;

    const deleteToken = await sha256(userPass.trim());

    const { data: delData, error: delError } = await window.supabase
        .from(table)
        .update({ is_active: false })
        .eq('id', id)
        .eq('delete_password', deleteToken)
        .select();

    if (delError) {
        alert("Hata: " + delError.message);
    } else if (delData && delData.length > 0) {
        alert("İçerik başarıyla kaldırıldı.");
        closeSocialModal();
        loadPortalData();
    } else {
        alert("Hata: Şifre yanlış!");
    }
};

/* >> TAVSİYE DETAY KURUMSAL MODÜLÜ - V13.0 << */
window.openSocialDetail = async function(table, id) {
    try {
        window.currentDetailTable = table;
        const { data: s, error } = await window.supabase.from(table).select('*').eq('id', id).single();
        if (error || !s) return;

        // Değişken isimleri benzersiz hale getirildi (Conflict Fix)
        const modalTitle = s.title || "Tavsiye Detayı";
        const modalContent = s.comment || s.content || ""; 
        const modalDate = new Date(s.created_at).toLocaleDateString('tr-TR');
        const modalImages = [s.image_url, s.image_url_2].filter(Boolean);

        // 1. ÜST BİLGİ ALANI (İÇ İÇE GEÇME ENGELLENDİ)
        document.getElementById("social-modal-title").innerHTML = `
            <div class="modal-header-meta" style="margin-bottom:15px;">
                <span style="display:inline-block; font-weight:800; color:#ffc107; font-size:0.8rem; letter-spacing:1px; text-transform:uppercase;">⭐ TAVSİYE İNCELEMESİ</span>
                <h2 style="margin:8px 0; font-size:1.4rem; color:var(--dark-text); line-height:1.2;">${window.escapeHTML(modalTitle)}</h2>
                <span style="color:#aaa; font-size:0.8rem; font-weight:600;"><i class="far fa-calendar-alt"></i> ${modalDate}</span>
            </div>`;
        
        /* >> TAVSİYE/ŞİKAYET METNİ TEK KARE MÜHÜRÜ << */
        // openSocialDetail fonksiyonu içindeki social-modal-content satırını bununla değiştir:
        document.getElementById("social-modal-content").innerHTML = `
    <div class="ad-info-wrapper">
        <div class="ad-info-box">
            "${window.escapeHTML(modalContent)}"
        </div>
    </div>`;
        
        // 3. GÖRSEL ALANI
        const gallery = document.getElementById("social-image-gallery");
        if (gallery) {
            gallery.innerHTML = modalImages.length > 0 
                ? modalImages.map(src => `<img src="${src}" style="width:100%; border-radius:15px; margin-bottom:12px; box-shadow:var(--card-shadow-soft);">`).join('')
                : '<div style="height:5px;"></div>';
        }

        // 4. YORUM SİSTEMİ (İZOLE VE TEMİZ)
        const modalInner = document.querySelector("#social-detail-modal .modal-content");
        let commentBox = document.getElementById("social-comment-section");
        if (!commentBox) {
            commentBox = document.createElement("div");
            commentBox.id = "social-comment-section";
            modalInner.appendChild(commentBox);
        }

        commentBox.innerHTML = `
            <div id="comment-section" style="margin-top:20px; border-top:1.5px solid #f1f5f9; padding-top:15px; width:100%;">
                <h4 style="font-size:0.9rem; margin-bottom:12px; text-align:left; color:var(--app-blue);"><i class="fas fa-comments"></i> Sorular & Yorumlar</h4>
                <div id="social-comment-list" style="max-height:180px; overflow-y:auto; margin-bottom:12px; text-align:left;"></div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <input type="text" id="social-comment-nick" placeholder="Takma Ad" class="cyber-form" maxlength="10" style="height:40px; margin:0 !important;">
                    <textarea id="social-comment-text" placeholder="Yorumunuz..." class="cyber-form" maxlength="150" style="height:65px; margin:0 !important; padding:10px;"></textarea>
                    <button onclick="window.sendSocialComment('${id}', '${table}')" class="cyber-submit" style="background:var(--app-blue)!important; height:48px; border-radius:10px !important;">
                        <i class="fas fa-paper-plane"></i> GÖNDER
                    </button>
                </div>
            </div>`;

        window.loadSocialComments(id, table);

        // 5. KALDIRMA AKSİYONU
        const footerArea = document.getElementById("social-delete-btn")?.parentNode;
        if (footerArea) {
            footerArea.innerHTML = `
                <button onclick="window.prepareDeleteHizmet('${id}')" style="width:100%; margin-top:15px; background:none; border:none; color:#ff4d4d; text-decoration:underline; font-size:0.75rem; cursor:pointer; opacity:0.6;">
                    Bu içeriği sistemden kaldır
                </button>`;
        }

        const modal = document.getElementById("social-detail-modal");
        modal.style.display = "flex";
        setTimeout(() => { modal.style.visibility = "visible"; modal.style.opacity = "1"; }, 10);
    } catch (err) { console.error("Hizmet Hatası:", err); }
};

/* >> İZOLE YORUM KAYIT VE YÜKLEME MOTORLARI << */
window.sendSocialComment = async function(contentId, moduleType) {
    const nick = document.getElementById("social-comment-nick").value.trim();
    const text = document.getElementById("social-comment-text").value.trim();
    
    if(!nick || !text) return alert("Lütfen boş alan bırakmayın.");

    const { error } = await window.supabase.from('ilan_yorumlar').insert([{ 
        ilan_id: String(contentId), 
        nickname: nick, 
        mesaj: text,
        module_type: moduleType, // 'tavsiyeler' olarak mühürlenir
        is_approved: false 
    }]);

    if (!error) {
        alert("Yorumunuz onaya gönderildi.");
        document.getElementById("social-comment-text").value = "";
    }
};

window.loadSocialComments = async function(contentId, moduleType) {
    const list = document.getElementById("social-comment-list");
    const { data } = await window.supabase.from('ilan_yorumlar')
        .select('*').eq('ilan_id', String(contentId)).eq('module_type', moduleType).eq('is_approved', true);

    list.innerHTML = data?.map(c => `
        <div style="background:#f8fafc; padding:10px; border-radius:10px; margin-bottom:8px; border:1px solid #eee;">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:5px;">
                <b style="color:var(--app-blue);">${window.escapeHTML(c.nickname)}</b>
                <span style="color:#aaa;">${new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
            </div>
            <p style="margin:0; font-size:0.85rem; color:#444;">${window.escapeHTML(c.mesaj)}</p>
        </div>
    `).join('') || '<p style="color:#aaa; text-align:center; font-size:0.8rem;">İlk yorumu sen yap!</p>';
};

window.closeSocialModal = function() {
    const modal = document.getElementById("social-detail-modal");
    if (modal) {
        modal.style.opacity = "0";
        modal.style.visibility = "hidden";
        setTimeout(() => { modal.style.display = "none"; }, 300);
    }
};

/* >> YORUM MOTORU NİHAİ MÜHÜR V4.0 << */

window.loadComments = async function(contentId, moduleType = 'ilan') {
    const list = document.getElementById("comment-list");
    if (!list || !contentId) return;

    list.innerHTML = '<p style="color:#888; text-align:center; font-size:0.8rem;">Denetleniyor...</p>';

    const { data, error } = await window.supabase
        .from('ilan_yorumlar')
        .select('*')
        .eq('ilan_id', String(contentId)) // ID tipi mühürlendi
        .eq('module_type', moduleType)     // Modül tipi mühürlendi
        .eq('is_approved', true)           // Sadece onaylılar [cite: 19-01-2026]
        .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
        list.innerHTML = '<p style="color:#999; text-align:center; font-size:0.8rem;">Henüz onaylı yorum yok.</p>';
        return;
    }

    list.innerHTML = data.map(c => `
        <div style="margin-bottom:12px; padding:10px; background:#fff; border-radius:10px; border-bottom:1px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:var(--app-blue); font-size:0.8rem;">${window.escapeHTML(c.nickname)}</strong>
                <span style="font-size:0.65rem; color:#aaa;">${new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
            </div>
            <p style="margin:5px 0 0 0; font-size:0.85rem; color:#444; line-height:1.4;">${window.escapeHTML(c.mesaj)}</p>
        </div>
    `).join('');
};

/* >> GELİŞMİŞ TAKMA AD DENETİM MOTORU V5.0 << */
window.sendComment = async function(moduleType = 'ilan') {
    const nickEl = document.getElementById("comment-nick");
    const textEl = document.getElementById("comment-text");
    if (!nickEl || !textEl) return;

    const nick = nickEl.value.trim();
    const text = textEl.value.trim();
    const rawId = (moduleType === 'ilan') ? window.currentAdId : window.currentFirsatId;

    // --- TAKMA AD (NICKNAME) VALIDASYONU ---
    
    // 1. Temel Yapı: 3-10 Karakter, Sadece Harf ve Rakam
    const basicRegex = /^[a-zA-Z0-9çĞİıÖşüÇğİıÖŞÜ]{3,10}$/;
    
    // 2. Sadece Rakam Kontrolü (En az bir harf olmalı)
    const isOnlyNumber = /^\d+$/.test(nick);
    
    // 3. Ardışık Tekrar Kontrolü (Aynı karakter 3 kez yan yana gelemez)
    const hasTripleChar = /(.)\1{2,}/.test(nick);

    if (!basicRegex.test(nick)) {
        alert("HATA: Takma ad 3-10 karakter olmalı ve sadece harf/rakam içermelidir.");
        return;
    }
    if (isOnlyNumber) {
        alert("HATA: Takma ad sadece rakamlardan oluşamaz, en az bir harf içermelidir.");
        return;
    }
    if (hasTripleChar) {
        alert("HATA: Aynı karakteri 2 kereden fazla üst üste yazamazsınız (Örn: aaa veya 111 yasaktır).");
        return;
    }

    // --- YORUM METNİ VALIDASYONU ---
    const textRegex = /^[a-zA-Z0-9çĞİıÖşüÇğİıÖŞÜ\s\.\,\!\?\-\:\(\)\;]+$/;
    if (text.length > 150 || !textRegex.test(text)) {
        alert("HATA: Yorum 150 karakteri geçemez veya geçersiz karakter içeriyor.");
        return;
    }

    if (!rawId) return alert("Hata: İçerik kimliği bulunamadı.");

    // DB KAYIT İŞLEMİ (Mühürlü Yapı)
    const { error } = await window.supabase.from('ilan_yorumlar').insert([{ 
        ilan_id: String(rawId), 
        nickname: nick, 
        mesaj: text,
        module_type: moduleType,
        is_approved: false 
    }]);

    if (!error) {
        alert("Yorumunuz onaya gönderildi.");
        textEl.value = "";
        nickEl.value = "";
    } else {
        alert("Sistem Hatası: " + error.message);
    }
};

/* >> MİNİMAL RAMAZAN SAYACI << */
function startRamadanCountdown() {
    const targetDate = new Date("Feb 19, 2026 00:00:00").getTime();

    setInterval(function() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById("ramadan-status").innerHTML = "Hayırlı Ramazanlar!";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const timerText = `${days}g ${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
        const el = document.getElementById("countdown-timer");
        if (el) el.innerText = timerText;
    }, 1000);
}

// Uygulama yüklenince başlat
document.addEventListener("DOMContentLoaded", startRamadanCountdown);
