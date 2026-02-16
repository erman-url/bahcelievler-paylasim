/* >> BAHÇELİEVLER PRO ENGINE V4.3 - %100 ARINDIRILMIŞ NİHAİ SÜRÜM << */
const R2_WORKER_URL = "https://broad-mountain-f064.erman-urel.workers.dev"; //
window.R2_WORKER_URL = R2_WORKER_URL;
/* >> CLOUDFLARE D1 SORGU MOTORU << */
window.fetchFromD1 = async function(sqlQuery) {
    try {
        const response = await fetch(`${window.R2_WORKER_URL}?action=query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sql: sqlQuery })
        });
        return await response.json();
    } catch (e) {
        console.error("D1 Okuma Hatası:", e);
        return null;
    }
};
/* >> GÖRSEL OPTİMİZASYON MOTORU (KOTA DOSTU) << */
window.optimizeImage = async function(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200; // Standart HD genişlik
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    const optimizedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(optimizedFile);
                }, 'image/jpeg', 0.8); // %80 kalite ile sıkıştır
            };
        };
    });
};
const R2_PUBLIC_VIEW_URL = "https://pub-135fc4a127b54815aacf75dd25458a20.r2.dev"; //
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
window.loadedModules = {};

/* >> GÜVENLİK MOTORU: SHA-256 HASH << */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function hasOwnerCookie(id) {
    return document.cookie
        .split('; ')
        .some(row => row === `tavsiye_${id}=owner`);
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

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupForms();
    setupContactForm(); 
    setupQuoteForm(); 
    setupFirsatForm();
    setupKesintiForm(); 
    setupHizmetForm();  
    setupEstateForm();
    setupAdSearch(); 
    loadPortalData();
    fetchLiveInfo();
    setInterval(fetchLiveInfo, 15 * 60 * 1000);
    initSlider();
    setupDistrictFilter();
    renderTavsiyeler();
    startRamadanCountdown();


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
    const navItems = document.querySelectorAll(".nav-item, .nav-item-modern, .menu-card-modern, [data-target], .cyber-btn-block, .home-widget");
    
    const handleNavigation = (e) => {
        const trigger = e.target.closest("[data-target]");
        if (!trigger) return;
        
        const target = trigger.getAttribute("data-target");

        // >> LAZY LOAD KONTROLÜ <<
        if (!window.loadedModules[target]) {
            if (target === 'fiyat-dedektifi') {
                fetchAndRenderPiyasa();
                if (typeof renderEnflasyonGrafigi === 'function') renderEnflasyonGrafigi();
                window.loadedModules[target] = true;
            } else if (target === 'tavsiyeler') {
                renderTavsiyeler();
                window.loadedModules[target] = true;
            } else if (target === 'sikayet-hatti') {
                renderSikayetler();
                window.loadedModules[target] = true;
            } else if (target === 'firsatlar') {
                renderFirsatlar();
                window.loadedModules[target] = true;
            } else if (target === 'kesintiler') {
                renderKesintiler();
                window.loadedModules[target] = true;
            } else if (target === 'hizmetler') {
                renderHizmetler();
                window.loadedModules[target] = true;
            }
        }

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
            fetchDuyurular(), // Duyuru Motoru Güncellendi
            fetchHaberler(), // Haber Motoru Başlatıldı
        ]);

        await renderKesintiler();

        updateDashboard();
    } catch (err) { console.error("Portal yükleme hatası:", err); }
}

/* >> PİYASA RADAR VERİLERİNİ ÇEK VE BAS << */
async function fetchAndRenderPiyasa() {
    const container = document.getElementById('fiyat-dedektifi-listesi'); // index.html'deki gerçek ID
    if (!container) return;

    try {
        const { data, error } = await window.supabase
            .from('piyasa_verileri') // Görüntüdeki tablo adı ile eşlendi
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">Henüz radar verisi girilmemiş.</p>';
            return;
        }

        container.innerHTML = data.map(item => `
            <div class="menu-card-modern" onclick="window.openRadarDetail('${item.id}')" style="border-left:5px solid var(--cyber-pink);">
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:1.1rem; color:var(--primary-corp);">${window.escapeHTML(item.urun_adi)}</strong>
                        <span style="background:var(--cyber-pink); color:white; padding:4px 10px; border-radius:8px; font-weight:bold;">
                            ${item.fiyat} TL
                        </span>
                    </div>
                    <div style="margin-top:8px; display:flex; gap:10px; font-size:0.8rem; color:#64748b;">
                        <span><i class="fas fa-store"></i> ${window.escapeHTML(item.market_adi)}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${window.escapeHTML(item.district || 'Bahçelievler')}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Radar hatası:", err);
    }
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
            const uploadedImageUrl = await uploadToR2(file);
            
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
async function uploadToR2(file) {
    const fileName = `resim_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const response = await fetch(`${R2_WORKER_URL}?file=${fileName}`, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
    });
    if (response.ok) return `${R2_PUBLIC_VIEW_URL}/${fileName}`;
    throw new Error("R2 Yükleme Hatası");
}

async function handleMultipleUploads(files) {
    if (!files || files.length === 0) return [];
    // En fazla 3 dosya alınır (Kota Mühürü) ve hepsi aynı anda yüklenir.
    const filesToUpload = Array.from(files).slice(0, 3);
    return Promise.all(filesToUpload.map(uploadToR2));
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

    if (!fileInput.files || fileInput.files.length === 0)
        return alert("HATA: En az 1 görsel eklemek zorunludur!");

    const passCheck = window.validateComplexPassword(passVal);
    if (passCheck) return alert(passCheck);

    isProcessing = true;
    btn.disabled = true;
    btn.textContent = "İŞLENİYOR...";

    try {
        const optimizedFiles = await Promise.all(
            Array.from(fileInput.files).map(f => optimizeImage(f))
        );

        const urls = await handleMultipleUploads(optimizedFiles);
        const deleteToken = await sha256(passVal);

        const payload = {
            title: titleVal,
            comment: contentVal,
            rating: ratingVal,
            district: districtVal,
            delete_password: deleteToken,
            image_url: urls[0] || null,
            image_url_2: urls[1] || null,
            category: "Tavsiye",
            is_active: true
        };

        const { data, error } = await window.supabase
            .from('tavsiyeler')
            .insert([payload])
            .select();

        if (error) throw error;

        if (data && data.length > 0) {
            const newId = data[0].id;
            document.cookie = `tavsiye_${newId}=owner; max-age=31536000; path=/`;
        }

        alert("Tavsiyeniz başarıyla panoya eklendi!");
        e.target.reset();
        await renderTavsiyeler();

    } catch (err) {
        alert("Hata: " + err.message);
    } finally {
        isProcessing = false;
        btn.disabled = false;
        btn.textContent = "PAYLAŞ";
    }
});



/* >> SORUN BİLDİR MOTORU V6.0: SPAM KORUMALI << */
document.getElementById("complaint-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    if (isBotDetected("complaint-form") || isProcessing) return;
    
    const titleVal = document.getElementById("comp-title").value.trim();
    const contentVal = document.getElementById("comp-content").value.trim();
    const districtVal = document.getElementById("comp-district").value;
    const passVal = document.getElementById("comp-pass").value;
    const fileInput = document.getElementById("comp-files");

    // 1. SPAM VE ANLAMSIZ METİN KONTROLÜ
    const spamRegex = /(.)\1{3,}/; // Aynı karakterden 4 ve üzeri yan yana (ffff, 1111 vb.)
    if (spamRegex.test(titleVal) || spamRegex.test(contentVal)) {
        alert("HATA: Lütfen anlamsız karakter tekrarları yapmadan geçerli bir metin giriniz.");
        return;
    }

    // 2. KÜFÜR VE ARGO FİLTRESİ
    if (window.hasBadWords(titleVal) || window.hasBadWords(contentVal)) {
        alert("Lütfen topluluk kurallarına uygun bir dil kullanın.");
        return;
    }

    // 3. GÖRSEL BOYUT KONTROLÜ (3MB) [cite: 04-02-2026]
    if (fileInput.files.length > 1) {
        alert("En fazla 1 adet görsel ekleyebilirsiniz.");
        return;
    }
    if (fileInput.files[0] && fileInput.files[0].size > 3 * 1024 * 1024) {
        alert("HATA: Görsel boyutu 3MB'ı geçemez.");
        return;
    }

    // Şifre Kontrolü
    const passCheck = window.validateComplexPassword(passVal);
    if (passCheck) { alert(passCheck); return; }

    isProcessing = true;
    const btn = document.getElementById("comp-submit-btn");
    btn.disabled = true;
    btn.textContent = "İLETİLYOR...";

    try {
        let urls = [];
        if (fileInput.files.length > 0) {
            // Görsel optimizasyon motorunu kullan
            const optimized = await optimizeImage(fileInput.files[0]);
            urls = await handleMultipleUploads([optimized]);
        }

        const deleteToken = await sha256(passVal);
        const payload = {
            title: titleVal,
            content: contentVal,
            location_name: districtVal, // Mahalle verisi [cite: 04-02-2026]
            delete_password: deleteToken,
            category: document.getElementById("comp-category").value,
            image_url: urls[0] || null,
            is_active: true
        };

        const { error } = await window.supabase.from('sikayetler').insert([payload]);
        if (error) throw error;

        alert("Sorun bildirimiz yayına alındı. Teşekkürler!");
        e.target.reset();
        loadPortalData();
    } catch (err) {
        alert("Hata: " + err.message);
    } finally {
        isProcessing = false;
        btn.disabled = false;
        btn.textContent = "SORUNU BİLDİR";
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

    // Nickname Karakter Kontrolü (Sadece Harf, Rakam, Tire, Nokta)
    const nickInput = document.getElementById("firsat-nickname");
    if (nickInput) {
        nickInput.addEventListener("input", function() {
            this.value = this.value.replace(/[^a-zA-Z0-9.-]/g, '');
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isBotDetected("firsat-form") || isProcessing) return;

        const type = document.getElementById("firsat-type").value;
        const title = document.getElementById("firsat-title").value;
        const priceInfo = document.getElementById("firsat-price").value;
        const desc = document.getElementById("firsat-desc").value;
        const link = document.getElementById("firsat-link").value;
        const pass = document.getElementById("firsat-pass").value;
        const fileInput = document.getElementById("firsat-files");
        const files = fileInput.files;

        // Nickname Küfür Kontrolü
        const nicknameVal = document.getElementById("firsat-nickname").value;
        if (nicknameVal && window.hasBadWords(nicknameVal)) {
            return alert("Lütfen takma adınızda uygunsuz ifadeler kullanmayınız.");
        }

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
                type: type,
                nickname: nicknameVal || null
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
    
    try {
        // 1. Sorgu Gücü: Tüm verileri çek (is_active filtresi kaldırıldı)
        const { data, error } = await window.supabase.from('firsatlar')
            .select('*')
            .order('created_at', {ascending: false});
        
        if (error) throw error;

        // 2. HTML Onarımı: Listeyi temizle
        el.innerHTML = "";

        el.innerHTML = data?.map(f => {
            // 3. Hata Yakalama: Tekil veri hataları listeyi bozmasın
            try {
                // 4. Fallback Görsel: Resim yoksa placeholder kullan
                const displayImg = f.image_url || getPlaceholderImage(f.link);
                const isOnline = f.category === 'Online Ürün & Kampanya';
                const borderColor = isOnline ? '#007bff' : '#28a745';

                return `
                <div class="cyber-card ad-card" style="border-left: 6px solid ${borderColor}; padding: 15px;" onclick="openFirsatDetail('${f.id}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span style="font-size:0.65rem; font-weight:bold; text-transform:uppercase; background:#f0f4f8; color:#555; padding:4px 8px; border-radius:6px;">
                            ${window.escapeHTML(f.category)}
                        </span>
                        ${hasOwnerCookie(f.id) ? `
                        <button onclick="event.stopPropagation(); window.deleteFirsat('${f.id}')" style="background:none; border:none; color:#ff4d4d; cursor:pointer;">
                            <i class="fas fa-trash-alt"></i>
                        </button>` : ''}
                    </div>
                    
                    <h4 style="margin:0 0 10px 0; font-size:1.1rem; color:var(--dark-text);">${window.escapeHTML(f.title)}</h4>
                    
                    <div style="width:100%; height:180px; background:#f9f9f9; border-radius:10px; overflow:hidden; margin-bottom:12px;">
                        <img src="${displayImg}" onerror="this.src='https://via.placeholder.com/150?text=Firsat'" style="width:100%; height:100%; object-fit:contain; padding:10px;">
                    </div>

                    <div style="background: #fdfdfd; padding: 10px; border-radius: 8px; border: 1px dashed #eee;">
                        <p style="font-size:0.85rem; color:#444; line-height:1.4; margin:0;">
                            ${window.escapeHTML(f.content)}
                        </p>
                    </div>
                </div>`;
            } catch (err) {
                console.error("Fırsat render hatası:", err);
                return ""; // Hatalı kartı atla
            }
        }).join('') || "<p style='text-align:center; padding:20px; color:#888;'>Henüz fırsat bulunmuyor.</p>";
    } catch (err) {
        console.error("Fırsat yükleme hatası:", err);
        el.innerHTML = "<p style='text-align:center; padding:20px; color:red;'>Veriler yüklenirken bağlantı sorunu oluştu.</p>";
    }
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
        
        const cList = document.getElementById("comment-list");
        if(cList) {
            cList.innerHTML = `<div style="text-align:center; margin:10px 0;"><button onclick="window.loadComments('${f.id}', 'firsat')" style="background:none; border:none; color:var(--app-blue); font-weight:bold; cursor:pointer; text-decoration:underline; font-size:0.9rem;"><i class="far fa-comments"></i> Yorumları Göster</button></div>`;
        }

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

  async function renderTavsiyeler() {
    const el = document.getElementById('recommend-list');
    if (!el) return;

    try {
        const { data, error } = await window.supabase
            .from('tavsiyeler')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        el.innerHTML = '';

        if (!data || data.length === 0) {
            el.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">Henüz onaylanmış bir tavsiye bulunmuyor.</p>';
            return;
        }

        el.innerHTML = data.map(item => `
            <div class="cyber-card" style="margin-bottom:15px; border-bottom:1px solid #eee; cursor:pointer;" onclick="window.openSocialDetail('tavsiyeler', '${item.id}')">

                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:var(--app-blue); font-size:1.1rem;">
                        ${window.escapeHTML(item.title)}
                    </strong>

                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="color:#FFD700;">
                            ${"⭐".repeat(item.rating || 5)}
                        </span>

                        ${
                            hasOwnerCookie(item.id)
                            ? `
                            <button onclick="event.stopPropagation(); window.deleteTavsiye('${item.id}')"
                                    style="background:none; border:none; color:#ff4d44; cursor:pointer;">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                            `
                            : ''
                        }
                    </div>
                </div>

                ${item.image_url ? `
                    <div style="margin:12px 0;">
                        <img src="${item.image_url}"
                             style="width:100%; border-radius:15px; max-height:220px; object-fit:cover;">
                    </div>
                ` : ''}

                <div style="background:#f8fafc; padding:12px; border-radius:12px; border-left:4px solid var(--app-blue); margin-top:10px;">
                    <p style="margin:0; font-style:italic; color:#334155;">
                        "${window.escapeHTML(item.comment)}"
                    </p>
                </div>

                <div style="margin-top:10px; display:flex; justify-content:space-between; font-size:0.75rem; color:#94a3b8;">
                    <span><i class="fas fa-map-marker-alt"></i> ${window.escapeHTML(item.district || 'Bahçelievler')}</span>
                    <span><i class="far fa-calendar-alt"></i> ${new Date(item.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error("Tavsiye Hatası:", err);
        el.innerHTML = '<p style="text-align:center; color:red; padding:20px;">Veriler çekilirken hata oluştu.</p>';
    }
}
              
          


window.deleteFirsat = async function(id) {

    const userPass = prompt("Bu fırsatı silmek için lütfen şifrenizi girin:");
    if (!userPass || !userPass.trim()) return;

    const deleteToken = await sha256(userPass.trim());

    const { error } = await window.supabase
        .from('firsatlar')
        .delete()
        .eq('id', id)
        .eq('delete_password', deleteToken);

    if (error) {
        alert("Şifre yanlış veya işlem başarısız.");
        return;
    }

    alert("Fırsat kaldırıldı.");
    renderFirsatlar();
};

