/* >> BAHÇELİEVLER PRO ENGINE V4.3 - %100 ARINDIRILMIŞ NİHAİ SÜRÜM << */
let slideIndex = 0;
let allAds = [];
let isProcessing = false;
let currentCategory = 'all'; 

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupForms();
    setupContactForm(); 
    setupQuoteForm(); 
    setupFirsatForm();
    setupKesintiForm(); 
    setupHizmetForm();  
    renderHizmetler();  
    setupAdSearch(); 
    loadPortalData();
    fetchLiveInfo();
    setInterval(fetchLiveInfo, 15 * 60 * 1000);
    initSlider();
});

// --- 1. NAVİGASYON MOTORU (TEK VE STABİL) ---
function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item, .cyber-btn-block, .home-widget");
    let startY = 0;
    const scrollThreshold = 10; 

    const handleNavigation = (e) => {
        const trigger = e.target.closest("[data-target]");
        if (!trigger) return;

        const target = trigger.getAttribute("data-target");
        const href = trigger.getAttribute("href");

        // Sayfa geçişini başlat
        if (!href || href === "#" || href === "") {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();

            // 1. KESİN GİZLEME: Tüm sayfaları ve ana sayfa bileşenlerini kapat
            document.querySelectorAll(".page").forEach(p => {
                p.classList.remove("active");
                p.style.display = "none";
                p.style.opacity = "0";
                p.style.visibility = "hidden";
            });

            // Ana sayfa özel bileşenlerini hedef "home" değilse gizle
            const homeComponents = [
                document.querySelector(".slider-container"),
                document.getElementById("home-dashboard"),
                document.querySelector(".home-hero"),
                document.getElementById("info-bar")
            ];

            if (target === "home") {
                homeComponents.forEach(el => { if(el) el.style.display = "block"; });
                if(document.getElementById("home-dashboard")) document.getElementById("home-dashboard").style.display = "grid";
            } else {
                homeComponents.forEach(el => { if(el) el.style.display = "none"; });
            }

            // 2. HEDEF SAYFAYI GÖSTER
            const targetPage = document.getElementById(target);
            if (targetPage) {
                targetPage.style.display = "block";
                targetPage.style.visibility = "visible";
                targetPage.style.pointerEvents = "auto";
                
                // Reflow force (Animasyon stabilitesi için)
                void targetPage.offsetWidth; 
                
                targetPage.classList.add("active");
                setTimeout(() => { targetPage.style.opacity = "1"; }, 10);
                
                // KRİTİK: Sayfayı en üste taşı (Mobil uygulama hissi için)
                window.scrollTo({ top: 0, behavior: 'instant' });
            }

            // 3. ALT MENÜ İKONLARINI GÜNCELLE
            document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
            const activeLink = document.querySelector(`.nav-item[data-target="${target}"]`);
            if (activeLink) activeLink.classList.add("active");
        }
    };

    // Dokunma ve tıklama olaylarını bağla
    navItems.forEach(el => {
        el.addEventListener('touchstart', (e) => { startY = e.touches[0].pageY; }, { passive: true });
        el.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].pageY;
            if (Math.abs(endY - startY) < scrollThreshold) handleNavigation(e);
        }, { passive: false });
        el.addEventListener('click', (e) => {
            if (e.pointerType === "mouse" || !e.pointerType) handleNavigation(e);
        });
    });
}

// --- 2. VERİ YÜKLEME MOTORU ---
async function loadPortalData() {
    try {
        await Promise.allSettled([
            fetchAndRenderAds(),
            renderTavsiyeler(),
            renderSikayetler(),
            renderFirsatlar(),
            renderDuyurular(),
            renderKesintiler(),
            fetchAndRenderPiyasa() 
        ]);
        updateDashboard();
    } catch (err) { console.error("Portal yükleme hatası:", err); }
}

async function fetchAndRenderPiyasa() {
    try {
        const { data, error } = await window.supabase
            .from('piyasa_verileri')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data && window.PiyasaMotoru) {
            window.PiyasaMotoru.listeOlustur(data);
        }
    } catch (e) { console.error("Piyasa Motoru Çevrimdışı"); }
}

// --- 3. SLIDER BAŞLATICI (TÜM TARAYICILARDA STABİL) ---
function initSlider() {
    const slides = document.getElementsByClassName("slider-item");
    if (!slides || slides.length === 0) return;

    // İlk açılışta tüm slide'ları sıfırla
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        slides[i].style.opacity = "0";
        slides[i].style.visibility = "hidden";
    }

    // İlk slide'ı göster
    slideIndex = 0;
    slides[0].style.display = "block";
    slides[0].style.visibility = "visible";
    void slides[0].offsetWidth; // reflow
    slides[0].style.opacity = "1";

    // Döngüyü başlat
    slideIndex = 1;
    setTimeout(showSlides, 4000);
}


/* >> BOT KORUMA MOTORU << */
function isBotDetected() {
    const hpField = document.getElementById("hp_check");
    if (hpField && hpField.value !== "") {
        console.warn("Süper Kontrol: Bot algılandı, işlem reddedildi.");
        return true;
    }
    return false;
}

/* >> TEKLİF ALMA SİSTEMİ MOTORU << */
/* >> TEKLİF ALMA SİSTEMİ MOTORU - SÜPER KONTROL V3.6 << */
async function setupQuoteForm() {
    const quoteForm = document.getElementById("quote-request-form");
    if (!quoteForm) return;

    quoteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isBotDetected() || isProcessing) return; // BOT KONTROLÜ EKLENDİ

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

function setupForms() {
    const adForm = document.getElementById("new-ad-form");
    if (adForm) {
        adForm.addEventListener("submit", async e => {
            e.preventDefault();
            if (isBotDetected() || isProcessing) return; // BOT KONTROLÜ EKLENDİ

            const titleVal = document.getElementById("ad-title").value;
            const priceVal = document.getElementById("ad-price").value;
            const contentVal = document.getElementById("ad-content").value;
            const fileInput = document.getElementById("ads-files");
            
            if (!fileInput.files || fileInput.files.length === 0) {
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

            const btn = document.getElementById("ad-submit-button");
            isProcessing = true;
            btn.disabled = true;
            btn.textContent = "YAYINLA...";

            try {
                let urls = await handleMultipleUploads(fileInput.files);

                const { error } = await window.supabase.from('ilanlar').insert([{
                    title: titleVal,
                    price: priceVal,
                    category: document.getElementById("ad-category").value,
                    content: contentVal,
                    contact: document.getElementById("ad-contact").value, 
                    delete_password: document.getElementById("ad-delete-password").value,
                    image_url: urls[0] || null,
                    image_url_2: urls[1] || null,
                    image_url_3: urls[2] || null
                }]);

                if (error) throw error;
                alert("İlan yayınlandı!");
                adForm.reset();
                loadPortalData();
            } catch (err) {
                alert("Hata: " + err.message);
            } finally {
                isProcessing = false;
                btn.disabled = false;
                btn.textContent = "YAYINLA";
            }
        }); 
    } 

document.getElementById("recommend-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isBotDetected() || isProcessing) return; // BOT KONTROLÜ EKLENDİ

    const btn = e.target.querySelector('button');
    const titleVal = document.getElementById("rec-title").value;
    const ratingVal = parseInt(document.getElementById("rec-rating").value);
    const contentVal = document.getElementById("rec-content").value;
    const passVal = document.getElementById("rec-pass").value;
    const fileInput = document.getElementById("rec-file");

    isProcessing = true;
    btn.disabled = true;
    btn.textContent = "YAYINLANIYOR...";

    try {
        let uploadedUrl = null;
        if (fileInput && fileInput.files.length > 0) {
            const urls = await handleMultipleUploads(fileInput.files);
            uploadedUrl = urls[0];
        }

        const payload = {
            title: titleVal,
            comment: contentVal,
            rating: ratingVal,
            delete_password: passVal,
            image_url: uploadedUrl,
            category: "Genel" 
        };

        const { error } = await window.supabase.from('tavsiyeler').insert([payload]);
        if (error) throw error;

        alert("Tavsiyeniz başarıyla panoya eklendi!");
        e.target.reset();
        
        if (typeof loadPortalData === "function") loadPortalData();

    } catch (err) {
        console.error("L2 Uzman Desteği Gerekebilir:", err.message);
        alert("Hata: " + err.message);
    } finally {
        isProcessing = false;
        btn.disabled = false;
        btn.textContent = "PAYLAŞ";
    }
});

    document.getElementById("complaint-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        if (isBotDetected() || isProcessing) return; // BOT KONTROLÜ EKLENDİ
        
        const btn = document.getElementById("comp-submit-btn");
        const fileInput = document.getElementById("comp-files");
        
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

            const payload = {
                title: document.getElementById("comp-title").value,
                content: document.getElementById("comp-content").value,
                delete_password: document.getElementById("comp-pass").value,
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
}

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

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isBotDetected() || isProcessing) return; // BOT KONTROLÜ EKLENDİ

        const type = document.getElementById("firsat-type").value;
        const title = document.getElementById("firsat-title").value;
        const priceInfo = document.getElementById("firsat-price").value;
        const desc = document.getElementById("firsat-desc").value;
        const link = document.getElementById("firsat-link").value;
        const pass = document.getElementById("firsat-pass").value;
        const fileInput = document.getElementById("firsat-files");
        const files = fileInput.files;

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

            const payload = {
                title: title,
                content: desc ? `💰 FIRSAT: ${priceInfo}\n\n${desc}` : `💰 FIRSAT: ${priceInfo}`, 
                link: type === "online" ? link : null,
                category: type === 'yerel' ? 'Yerel Esnaf & Mağaza' : 'Online Ürün & Kampanya',
                image_url: urls[0] || null,
                image_url_2: urls[1] || null,
                delete_password: pass,
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

/* >> 2. FIRSAT RENDER MOTORU (KATEGORİ VE LOGO UYUMLU) << */
async function renderFirsatlar() {
    const el = document.getElementById('firsat-list');
    if (!el) return;
    const { data } = await window.supabase.from('firsatlar').select('*').order('created_at', {ascending: false});
    
    el.innerHTML = data?.map(f => {
        const displayImg = f.image_url || getPlaceholderImage(f.link);
        const isOnline = f.category === 'Online Ürün & Kampanya';
        const borderColor = isOnline ? '#007bff' : '#28a745';

        return `
        <div class="cyber-card ad-card" style="margin-bottom:15px; cursor:pointer; border-left: 5px solid ${borderColor};" onclick="openFirsatDetail('${f.id}')">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <span style="font-size:0.6rem; font-weight:bold; text-transform:uppercase; background:#eee; padding:2px 5px; border-radius:3px;">${f.category}</span>
                <button onclick="event.stopImmediatePropagation(); deleteFirsat('${f.id}')" style="background:none; border:none; color:#ff4d4d; cursor:pointer; padding:10px;"><i class="fas fa-trash"></i></button>
            </div>
            <h4 style="margin:5px 0;">${f.title}</h4>
            <img src="${displayImg}" style="width:100%; height:150px; object-fit:contain; background:#f9f9f9; border-radius:8px; margin:5px 0; padding:10px;">
            <p style="font-size:0.8rem; color:#444; margin-top:5px; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.content}</p>
        </div>`;
    }).join('') || "";
}

window.openFirsatDetail = async function(id) {
    try {
        const { data: f, error } = await window.supabase.from('firsatlar').select('*').eq('id', id).single();
        if (error || !f) return;

        const dateStr = new Date(f.created_at).toLocaleDateString('tr-TR', {day:'2-digit', month:'2-digit', year:'numeric'});

        document.getElementById("modal-title").textContent = f.title;
        document.getElementById("modal-price").innerHTML = `
            <div style="display:flex; justify-content:space-between; width:100%; font-size:0.85rem; color:#666;">
                <span style="font-weight:bold; color:#28a745;">${f.category}</span>
                <span><i class="far fa-calendar-alt"></i> ${dateStr}</span>
            </div>`;
        
        const descriptionEl = document.getElementById("modal-description");
        if (descriptionEl) {
            descriptionEl.innerHTML = `<div style="white-space: pre-wrap; color: #333; margin-top:15px; font-size:1rem; line-height:1.5;">${f.content}</div>`;
        }

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
                buyBtn.onclick = () => window.open(f.link, '_blank');
            } else {
                buyBtn.textContent = "MAĞAZA BİLGİSİ";
                buyBtn.onclick = () => alert("Yerel esnaf fırsatıdır.");
            }
        }

        document.getElementById("ad-detail-modal").style.display = "block";

    } catch (err) {
        console.error("Detay hatası:", err);
    }
};
/* >> DİĞER FONKSİYONLAR << */
async function renderTavsiyeler() {
    const el = document.getElementById('recommend-list');
    if (!el) return;
    const { data } = await window.supabase.from('tavsiyeler').select('*').order('created_at', { ascending: false });
    el.innerHTML = data?.map(item => `
        <div class="cyber-card" style="margin-bottom:15px; border-bottom:1px solid #eee;">
            <div style="display:flex; justify-content:space-between;">
                <strong>${item.title}</strong>
                <span>${"⭐".repeat(item.rating || 5)}</span>
            </div>
            ${item.image_url ? `<img src="${item.image_url}" style="width:100%; border-radius:8px; margin:10px 0; max-height:200px; object-fit:cover;">` : ''}
            <p style="margin:8px 0; font-style:italic;">"${item.comment}"</p>
            <div style="text-align:right;">
                <button onclick="deleteTavsiye('${item.id}')" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:0.8rem;">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `).join('') || "";
}

async function renderSikayetler() {
    const el = document.getElementById('complaint-list');
    if (!el) return;
    const { data } = await window.supabase.from('sikayetler').select('*').order('created_at', { ascending: false });
    
    el.innerHTML = data?.map(i => `
        <div class="cyber-card" style="margin-bottom:15px; border-left: 5px solid #ff4d4d;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <span style="font-size:0.7rem; font-weight:bold; background:#ffebee; color:#c62828; padding:2px 6px; border-radius:4px;">${i.category}</span>
                <button onclick="event.stopPropagation(); deleteSikayet('${i.id}')" style="background:none; border:none; color:#999; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
            <h4 style="margin:10px 0 5px 0;">${i.title}</h4>
            <p style="font-size:0.9rem; color:#444;">${i.content}</p>
            <div style="display:flex; gap:5px; margin:10px 0;">
                ${i.image_url ? `<img src="${i.image_url}" style="width:48%; height:120px; object-fit:cover; border-radius:8px;">` : ''}
                ${i.image_url_2 ? `<img src="${i.image_url_2}" style="width:48%; height:120px; object-fit:cover; border-radius:8px;">` : ''}
            </div>
            <div style="text-align:right; font-size:0.6rem; color:#aaa;">${new Date(i.created_at).toLocaleDateString('tr-TR')}</div>
        </div>
    `).join('') || "";
}

window.deleteFirsat = async (id) => {
    const userPass = prompt("Bu fırsatı silmek için lütfen şifrenizi girin:");
    if (!userPass || !userPass.trim()) return;

    const { error } = await window.supabase.from('firsatlar').delete().eq('id', id).eq('delete_password', userPass); 

    if (!error) {
        alert("Fırsat başarıyla silindi.");
        loadPortalData(); // SÜPER KONTROL: Listeyi anında yeniler
    } else {
        alert("Hata: Şifre yanlış!");
    }
};

window.deleteTavsiye = async (id) => {
    const userPass = prompt("Bu tavsiyeyi silmek için şifrenizi girin:");
    if (userPass === null || !userPass.trim()) return;

    const { error } = await window.supabase
        .from('tavsiyeler')
        .delete()
        .eq('id', id)
        .eq('delete_password', userPass);

    if (!error) {
        alert("Tavsiye başarıyla silindi.");
        loadPortalData(); // Ekranda anında yok olmasını sağlar
    } else {
        alert("Hata: Girdiğiniz şifre yanlış.");
    }
};

window.deleteSikayet = async (id) => {
    const userPass = prompt("Bu şikayeti silmek için şifrenizi girin:");
    if (userPass === null || !userPass.trim()) return;

    const { error } = await window.supabase
        .from('sikayetler')
        .delete()
        .eq('id', id)
        .eq('delete_password', userPass); 

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
    const { data } = await window.supabase.from('ilanlar').select('*').order('created_at', {ascending: false});
    allAds = data || [];
    
    const searchInput = document.getElementById("ad-search-input");
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    applyFilters(currentCategory, searchTerm);
}

window.openAdDetail = function(id) {
    const ad = allAds.find(a => a.id == id);
    if (!ad) return;

    document.body.style.overflow = 'hidden'; // Arka plan kaydırmasını engelle

    document.getElementById("modal-title").textContent = ad.title;
    // Fiyat formatı tr-TR (1.000.000 TL) olarak korunuyor
    document.getElementById("modal-price").textContent = new Intl.NumberFormat('tr-TR').format(ad.price) + ' TL';

    const descriptionEl = document.getElementById("modal-description");
    const content = ad.content || '';
    const contact = ad.contact || '';

    // Güvenlik Düzeltmesi: Olası XSS saldırılarını engellemek için kullanıcı girdilerini güvenli hale getiriyoruz.
    const safeContent = content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

    if (contact) {
        const safeContact = contact.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        descriptionEl.innerHTML = safeContent + `<br><br><strong style="color:#007bff;"><i class="fas fa-phone"></i> İletişim:</strong> ${safeContact}`;
    } else {
        descriptionEl.innerHTML = safeContent;
    }

    const gallery = document.getElementById("modal-image-gallery");
    if (gallery) {
        const images = [ad.image_url, ad.image_url_2, ad.image_url_3].filter(Boolean);

        gallery.innerHTML = images.length
            ? images.map(src => `<img src="${src}" alt="İlan görseli" style="width: 100%; border-radius: 8px; margin-bottom: 10px;">`).join('')
            : '<p style="text-align: center; color: #888; padding: 20px 0;">Bu ilan için görsel mevcut değil.</p>';
    }

    document.getElementById("modal-buy-btn").onclick = () => {
        if (ad.contact) {
            const copyText = ad.contact;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(copyText).then(() => {
                    alert("İletişim bilgisi panoya kopyalandı: " + copyText);
                }, () => {
                    alert("Kopyalanamadı. İletişim Bilgisi: " + copyText);
                });
            } else {
                alert("İletişim Bilgisi: " + copyText);
            }
        } else {
            alert("Bu ilanda iletişim bilgisi bulunmuyor.");
        }
    };

    document.getElementById("modal-delete-btn-inner").onclick = () => {
        const userPass = prompt("Bu ilanı silmek için 4 haneli şifrenizi girin:");
        if (userPass === null || userPass.trim() === '') return;
        
        // Güvenli Silme: Şifre kontrolü artık doğrudan Supabase RLS ile yapılıyor.
        window.supabase
            .from('ilanlar')
            .delete()
            .eq('id', ad.id)
            .eq('delete_password', userPass)
            .then(({ error }) => {
                if (error) {
                    alert("Hata: Şifre yanlış veya bir sorun oluştu! " + error.message);
                } else {
                    alert("İlan başarıyla silindi.");
                    closeModal();
                    loadPortalData();
                }
            });
    };

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
        document.body.style.overflow = 'auto';
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
            .select('urun_adi, fiyat, market_adi, image_url')
            .order('created_at', {ascending: false})
            .limit(1);

        if (lastPiyasa?.[0]) {
            const previewPiyasa = document.getElementById("preview-piyasa");
            if (previewPiyasa) {
                previewPiyasa.innerHTML = `${lastPiyasa[0].urun_adi}<br><span style="color:var(--cyber-pink);">${lastPiyasa[0].fiyat} TL</span> <small style="color:#888;">@${lastPiyasa[0].market_adi}</small>`;
            }
            const imgEl = document.getElementById("preview-piyasa-img");
            if (imgEl && lastPiyasa[0].image_url) imgEl.style.backgroundImage = `url('${lastPiyasa[0].image_url}')`;
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
    if (!slides.length) return;
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        slides[i].style.opacity = "0";
        slides[i].style.visibility = "hidden";
    }
    
    if (slideIndex >= slides.length) {
        slideIndex = 0;
    }
    
    const currentSlide = slides[slideIndex];
    if (currentSlide) {
        currentSlide.style.display = "block";
        currentSlide.style.visibility = "visible";
        void currentSlide.offsetWidth;
        setTimeout(() => {
            currentSlide.style.opacity = "1";
        }, 10);
    }
    
    slideIndex++;
    setTimeout(showSlides, 4000);
}

async function renderDuyurular() {
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

    if (previewEl && data.length > 0) {
        previewEl.textContent = data[0].title;
    }

    if (listEl) {
        listEl.innerHTML = data.map(d => `
            <div class="cyber-card" style="margin-bottom:15px; border-left: 5px solid #ff007f;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <small style="color:#888;">${new Date(d.created_at).toLocaleDateString('tr-TR')}</small>
                    <i class="fas fa-bullhorn" style="color:#ff007f;"></i>
                </div>
                <h3 style="margin:10px 0 5px 0; color:var(--dark);">${d.title}</h3>
                <p style="font-size:0.9rem; color:#444; line-height:1.4;">${d.content}</p>
            </div>
        `).join('') || "<p style='text-align:center; padding:20px;'>Aktif duyuru bulunmuyor.</p>";
    }
}

async function setupKesintiForm() {
    const form = document.getElementById("kesinti-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isBotDetected() || isProcessing) return; // BOT KONTROLÜ EKLENDİ

        const btn = document.getElementById("kes-submit-btn");
        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "BİLDİRİLİYOR...";

        try {
            const payload = {
                type: document.getElementById("kes-type").value,
                location: document.getElementById("kes-location").value,
                description: document.getElementById("kes-desc").value,
                delete_password: document.getElementById("kes-pass").value
            };

            const { error } = await window.supabase.from('kesintiler').insert([payload]);
            if (error) throw error;

            alert("Kesinti bildirimi yayınlandı!");
            form.reset();
            renderKesintiler();
        } catch (err) {
            alert("Hata: " + err.message);
        } finally {
            isProcessing = false;
            btn.disabled = false;
            btn.textContent = "BİLDİRİM GÖNDER";
        }
    });
}

async function renderKesintiler() {
    const el = document.getElementById('kesinti-list');
    if (!el) return;

    const { data } = await window.supabase.from('kesintiler').select('*').order('created_at', { ascending: false });

    el.innerHTML = data?.map(k => `
        <div class="cyber-card" style="margin-bottom:12px; border-left: 5px solid ${k.type === 'Elektrik' ? '#ffc107' : k.type === 'Su' ? '#00d2ff' : '#ff4d4d'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:${k.type === 'Elektrik' ? '#b8860b' : '#007bff'};">${k.type} Kesintisi</strong>
                <button onclick="deleteKesinti('${k.id}', '${k.delete_password}')" style="background:none; border:none; color:#ccc;"><i class="fas fa-trash"></i></button>
            </div>
            <p style="margin:5px 0; font-weight:bold; font-size:0.9rem;"><i class="fas fa-map-marker-alt"></i> ${k.location}</p>
            <p style="margin:0; font-size:0.85rem; color:#555;">${k.description}</p>
            <div style="text-align:right; font-size:0.6rem; color:#999; margin-top:5px;">${new Date(k.created_at).toLocaleTimeString('tr-TR')}</div>
        </div>
    `).join('') || "<p style='text-align:center;'>Şu an bildirilmiş bir kesinti yok.</p>";
}

window.deleteKesinti = async (id, correctPass) => {
    const userPass = prompt("Silmek için şifre:");
    if (userPass === correctPass) {
        await window.supabase.from('kesintiler').delete().eq('id', id);
        renderKesintiler();
    }
};

window.showLegal = function(type) {
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

function applyFilters(category, searchTerm) {
    const list = document.getElementById("ads-list");
    if (!list) return;
    
    let filtered = allAds;
    
    if (category !== 'all') {
        filtered = filtered.filter(ad => ad.category === category);
    }
    
    if (searchTerm && searchTerm.length > 0) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(ad => {
            const titleLower = (ad.title || '').toLowerCase();
            return titleLower.includes(searchLower);
        });
    }
    
    if (filtered.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <p style="font-size: 1rem; font-weight: bold;">Aradığınız kriterlere uygun ilan bulunamadı.</p>
                <p style="font-size: 0.85rem; margin-top: 5px;">Farklı bir arama terimi veya kategori deneyin.</p>
            </div>
        `;
    } else {
        list.innerHTML = filtered.map(ad => `
            <div class="ad-card cyber-card" onclick="openAdDetail('${ad.id}')">
                <div style="position:absolute; top:8px; left:8px; background:rgba(0,0,0,0.6); color:white; padding:2px 8px; border-radius:10px; font-size:0.6rem; z-index:1;">${ad.category}</div>
                <img src="${ad.image_url || 'https://via.placeholder.com/150'}">
                <div class="ad-card-info">
                    <div class="ad-card-id">#${ad.id.toString().slice(-5).toUpperCase()} | ${new Date(ad.created_at).toLocaleDateString('tr-TR')}</div>
                    <div style="font-weight:bold; font-size:1.1rem; color:var(--dark); margin:2px 0;">${new Intl.NumberFormat('tr-TR').format(ad.price)} TL</div>
                    <div style="font-size:0.85rem; color:#444; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${ad.title}</div>
                </div>
            </div>
        `).join('');
    }
}

window.filterAds = function(category, clickedButton) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    currentCategory = category;
    const searchInput = document.getElementById("ad-search-input");
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    applyFilters(category, searchTerm);
};

window.searchOnMap = function() {
    const query = document.getElementById('map-search-input').value;
    if (!query) return alert("Lütfen aramak istediğiniz usta türünü yazın.");
    
    const mapIframe = document.getElementById('target-map');
    const freeSearchUrl = `https://www.google.com/search?q=https://maps.google.com/maps%3Fq%3D${encodeURIComponent(query)}+Bahçelievler+İstanbul&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    
    mapIframe.src = freeSearchUrl;
};


/* >> HİZMET TANITIM MOTORU - GÖRSEL ZORUNLULUĞU V1.1 << */
async function setupHizmetForm() {
    const form = document.getElementById("hizmet-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isBotDetected() || isProcessing) return; // BOT KONTROLÜ EKLENDİ

        const fileInput = document.getElementById("hizmet-file");
        const btn = document.getElementById("hizmet-submit-btn");

        if (!fileInput.files || fileInput.files.length === 0) {
            alert("HATA: Hizmetinizi tanıtmak için lütfen bir görsel ekleyiniz.");
            fileInput.focus();
            return; 
        }

        const file = fileInput.files[0];
        const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        if (!allowedExtensions.exec(file.name)) {
            alert("HATA: Sadece .png veya .jpg formatında görsel yükleyebilirsiniz.");
            return;
        }

        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "YÜKLENİYOR...";

        try {
            let urls = await handleMultipleUploads(fileInput.files);
            let uploadedUrl = urls[0];

            const payload = {
                category: document.getElementById("hizmet-category").value,
                title: document.getElementById("hizmet-firma").value, 
                content: document.getElementById("hizmet-desc").value,
                image_url: uploadedUrl,
                delete_password: document.getElementById("hizmet-pass").value
            };

            const { error } = await window.supabase.from('hizmetler').insert([payload]);
            if (error) throw error;

            alert("Hizmet tanıtımınız başarıyla eklendi!");
            form.reset();
            renderHizmetler();
        } catch (err) {
            alert("Hata: " + err.message);
        } finally {
            isProcessing = false;
            btn.disabled = false;
            btn.textContent = "HİZMETİ YAYINLA";
        }
    });
}

async function renderHizmetler() {
    const el = document.getElementById('hizmet-list');
    if (!el) return;

    const { data } = await window.supabase.from('hizmetler').select('*').order('created_at', { ascending: false });

    el.innerHTML = data?.map(h => `
        <div class="cyber-card" style="margin-bottom:15px; border-left: 5px solid #28a745;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="student-badge" style="background:#e8f5e9; color:#2e7d32;">${h.category}</span>
                <button onclick="deleteHizmet('${h.id}', '${h.delete_password}')" style="background:none; border:none; color:#ccc;"><i class="fas fa-trash"></i></button>
            </div>
            <h3 style="margin:10px 0 5px 0;">${h.title}</h3>
            ${h.image_url ? `<img src="${h.image_url}" style="width:100%; border-radius:8px; margin:8px 0;">` : ''}
            <p style="font-size:0.9rem; color:#444;">${h.content}</p>
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
window.deleteAd = async (id, correctPass) => {
    const userPass = prompt("İlanı silmek için 4 haneli şifrenizi girin:");
    if (!userPass) return;

    const { error } = await window.supabase
        .from('ilanlar')
        .delete()
        .eq('id', id)
        .eq('delete_password', userPass); 

    if (error) {
        alert("Hata: Şifre yanlış veya silme yetkiniz yok!");
    } else {
        alert("İlan başarıyla kaldırıldı.");
        if (typeof closeModal === "function") closeModal(); 
        loadPortalData(); 
    }
};