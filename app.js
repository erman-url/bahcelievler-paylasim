/* >> BAHÇELİEVLER PRO ENGINE V3.5 - STABİLİZE EDİLMİŞ TAM SÜRÜM << */
let slideIndex = 0;
let allAds = [];
let isProcessing = false;
let currentCategory = 'all'; // Seçili kategoriyi takip et 

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupForms();
    setupContactForm(); // Sadece bir kez çağrılmalı
    setupQuoteForm(); 
    setupFirsatForm();
    setupStudentForm(); 
    setupKesintiForm(); 
    setupHizmetForm();  
    renderHizmetler();  
    setupAdSearch(); // Arama çubuğu event listener'ı
    loadPortalData();
    fetchLiveInfo();
    setInterval(fetchLiveInfo, 15 * 60 * 1000);
    
    if (document.getElementsByClassName("slider-item").length > 0) {
        showSlides();
    }
});

async function loadPortalData() {
    // Tüm yüklemeleri aynı anda başlatır, hızı 3 kat artırır
    Promise.allSettled([
        fetchAndRenderAds(),
        renderTavsiyeler(),
        renderSikayetler(),
        renderFirsatlar(),
        renderDuyurular(),
        renderStudents(),
        renderKesintiler()
    ]).then(() => {
        updateDashboard();
        console.log("Portal verileri hücresel uyumlu yüklendi.");
    });
}

function setupNavigation() {
    // Tüm navigasyon tetikleyicilerini seç
    const navItems = document.querySelectorAll(".nav-item, .cyber-btn-block, .home-widget");
    
    navItems.forEach(item => {
        item.addEventListener("click", e => {
            // .closest() kullanarak tıklanan yer neresi olursa olsun 
            // data-target olan ana öğeyi buluruz.
            const trigger = e.target.closest("[data-target]");
            if (!trigger) return;

            const target = trigger.getAttribute("data-target");
            const href = trigger.getAttribute("href");

            // Eğer bir dış link değilse portal içi geçişi başlat
            if (!href || href === "#" || href === "") {
                e.preventDefault();

                // 1. Tüm sayfaları gizle
                document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
                
                // 2. Hedef sayfayı göster
                const targetPage = document.getElementById(target);
                if (targetPage) {
                    targetPage.classList.add("active");
                } else {
                    console.error("HATA: " + target + " id'li sayfa bulunamadı!");
                    return;
                }

                // 3. Navigasyon butonlarındaki 'active' sınıfını güncelle
                document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
                const activeLink = document.querySelector(`.nav-item[data-target="${target}"]`);
                if (activeLink) activeLink.classList.add("active");

                // 4. Sayfayı en tepeye kaydır (Mobil deneyimi için kritik)
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}


/* >> TEKLİF ALMA SİSTEMİ MOTORU << */
/* >> TEKLİF ALMA SİSTEMİ MOTORU - SÜPER KONTROL V3.6 << */
async function setupQuoteForm() {
    const quoteForm = document.getElementById("quote-request-form");
    if (!quoteForm) return;

    quoteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isProcessing) return; // Çift tıklamayı engelle

        const fileInput = document.getElementById("quote-file");
        const emailInput = document.getElementById("quote-email");
        const btn = document.getElementById("quote-submit-btn");

        // --- 1. MANTIK KONTROLÜ: GÖRSEL ZORUNLULUĞU ---
        if (!fileInput.files || fileInput.files.length === 0) {
            alert("HATA: Teklif alabilmek için lütfen bir görsel (.png veya .jpg) ekleyiniz.");
            fileInput.focus();
            return; // İşlemi burada keser, Supabase'e gitmez
        }

        // --- 2. KOD KONTROLÜ: DOSYA UZANTISI ---
        const file = fileInput.files[0];
        const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        if (!allowedExtensions.exec(file.name)) {
            alert("HATA: Sadece .png, .jpg veya .jpeg uzantılı dosyalar kabul edilmektedir.");
            fileInput.value = ''; // Seçimi temizle
            return;
        }

        // --- 3. SENARYO KONTROLÜ: E-POSTA FORMATI ---
        const emailValue = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            alert("HATA: Lütfen geçerli bir e-posta adresi yazınız (Örn: isim@mail.com)");
            emailInput.focus();
            return;
        }

        // --- TÜM KONTROLLER GEÇİLDİ, ŞİMDİ İŞLEMİ BAŞLAT ---
        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "İŞLENİYOR...";

        try {
            // Görseli Supabase Storage'a yükle
            const fileName = `teklif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const { data, error: storageError } = await window.supabase.storage
                .from('ilanlar')
                .upload(fileName, file);
            
            if (storageError) throw storageError;
            
            const { data: urlData } = window.supabase.storage.from('ilanlar').getPublicUrl(fileName);
            const uploadedImageUrl = urlData.publicUrl;

            // Veritabanına kaydet
            const payload = {
                category: document.getElementById("quote-category").value,
                talep_metni: document.getElementById("quote-text").value,
                email: emailValue,
                image_url: uploadedImageUrl
            };

            const { error: dbError } = await window.supabase.from('teklifal').insert([payload]);
            if (dbError) throw dbError;

            // EmailJS ile bildirim gönder
            const emailParams = {
                name: `Teklif: ${payload.category}`,
                email: payload.email,
                message: `Talep Detayı: ${payload.talep_metni}\nGörsel: ${uploadedImageUrl}`,
                title: "Yeni Teklif Talebi"
            };
            await emailjs.send('service_hdlldav', 'template_1qzuj7s', emailParams);

            // BAŞARI MESAJI
            alert("Talebiniz bize ulaştı, en kısa sürede mail adresinize dönüş yapılacaktır.");
            
            quoteForm.reset();
            // Kullanıcıyı hizmetler listesine geri döndür
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

// setupForms fonksiyonu içindeki ilan submit kısmı:
// ... adForm.addEventListener("submit", async e => { ...
const fileInput = document.getElementById("ads-files");
const contentVal = document.getElementById("ad-content").value;

// 1. FOTOĞRAF ZORUNLULUĞU KONTROLÜ
if (!fileInput.files || fileInput.files.length === 0) {
    alert("HATA: İlan yayınlamak için en az 1 adet fotoğraf yüklemek zorunludur!");
    return;
}
// 2. ADET KONTROLÜ
if (fileInput.files.length > 4) {
    alert("HATA: En fazla 4 adet fotoğraf seçebilirsiniz.");
    return;
}
// 3. KARAKTER KONTROLÜ (350 Sınırı ve Karakter Filtresi)
if (contentVal.length > 350) {
    alert("HATA: Açıklama 350 karakteri geçemez.");
    return;
}
const safeRegex = /^[a-zA-Z0-9çĞİıÖşüÇğİıÖŞÜ\s\.\,\!\?\-\:\(\)\;\/]+$/;
if (!safeRegex.test(contentVal)) {
    alert("HATA: Açıklamada geçersiz karakterler var.");
    return;
}

function setupForms() {
    const adForm = document.getElementById("new-ad-form");
    if (adForm) {
        adForm.addEventListener("submit", async e => {
            e.preventDefault();
            if (isProcessing) return;

            const titleVal = document.getElementById("ad-title").value;
            const priceVal = document.getElementById("ad-price").value;
            const contentVal = document.getElementById("ad-content").value;
            
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
                const fileInput = document.getElementById("ads-files");
                let urls = await handleMultipleUploads(fileInput.files);

                const { error } = await window.supabase.from('ilanlar').insert([{
    title: titleVal,
    price: priceVal,
    category: document.getElementById("ad-category").value,
    content: contentVal,
    contact: document.getElementById("ad-contact").value, // BU SATIRI EKLE
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

    document.getElementById("recommend-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        if (isProcessing) return;
        const btn = e.target.querySelector('button');
        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "YAYINLANIYOR...";

        try {
            const fileInput = document.getElementById("rec-file");
            let uploadedUrl = null;
            if (fileInput && fileInput.files.length > 0) {
                let urls = await handleMultipleUploads(fileInput.files);
                uploadedUrl = urls[0];
            }

            const payload = {
                title: document.getElementById("rec-title").value,
                comment: document.getElementById("rec-content").value,
                rating: parseInt(document.getElementById("rec-rating").value),
                delete_password: document.getElementById("rec-pass").value,
                image_url: uploadedUrl,
                category: "Genel"
            };

            const { error } = await window.supabase.from('tavsiyeler').insert([payload]);
            if (!error) { 
                alert("Tavsiyeniz eklendi!"); 
                e.target.reset(); 
                loadPortalData(); 
            }
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
        if (isProcessing) return;
        
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
            // Tarihi otomatik bugüne ayarla
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
            label.style.color = "#d32f2f"; // Yerel için kırmızı (uyarıcı)
        } else {
            label.innerHTML = '<i class="fas fa-camera"></i> Görsel Ekle (Opsiyonel)';
            label.style.color = "#666"; // Online için gri (isteğe bağlı olduğunu belli eder)
        }
    }
    // >>> EKLEME BURADA BİTİYOR <<<
}

/* >> FIRSAT KAYIT MOTORU (GÜNCEL: FİYAT VE KESİN RESİM KONTROLLÜ) << */
async function setupFirsatForm() {
    const form = document.getElementById("firsat-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isProcessing) return;

        const type = document.getElementById("firsat-type").value;
        const title = document.getElementById("firsat-title").value;
        const priceInfo = document.getElementById("firsat-price").value;
        const desc = document.getElementById("firsat-desc").value;
        const link = document.getElementById("firsat-link").value;
        const pass = document.getElementById("firsat-pass").value;
        const fileInput = document.getElementById("firsat-files");
        const files = fileInput.files;

        // --- DİNAMİK KONTROLLER ---

        // 1. ONLINE İÇİN ÖZEL DURUM: Sadece Link zorunlu, resim ve detay opsiyonel.
        if (type === "online") {
            if (!link) {
                alert("HATA: Online ürünler için Ürün Linki zorunludur!");
                return;
            }
        }

        // 2. YEREL ESNAF İÇİN KATI KURALLAR (Aynen Korundu)
        if (type === "yerel") {
            // Yerel'de Resim ZORUNLU
            if (files.length === 0) {
                alert("HATA: Yerel esnaf ilanları için en az 1 adet resim yüklemek zorunludur!");
                return;
            }
            // Yerel'de Detay ZORUNLU
            if (!desc || desc.trim() === "") {
                alert("HATA: Yerel esnaf ilanları için Detay/Adres yazmak zorunludur!");
                return;
            }
            // Resim sayısı sınırı
            if (files.length > 2) return alert("HATA: Maksimum 2 görsel seçebilirsiniz.");
            
            // Karakter kontrolü
            const safeRegex = /^[a-zA-Z0-9çĞİıÖşüÇğİıÖŞÜ\s\.\,\!\?\-\:\(\)]+$/;
            if (!safeRegex.test(title) || !safeRegex.test(desc)) {
                return alert("HATA: Sadece harf, rakam ve noktalama işaretleri kullanın.");
            }
        }

        isProcessing = true;
        document.getElementById("firsat-submit-btn").textContent = "YÜKLENİYOR...";

        try {
            // Resim varsa yükle, yoksa boş dizi dön
            let urls = files.length > 0 ? await handleMultipleUploads(files) : [];

            const payload = {
                title: title,
                // Detay opsiyonel olduğu için boşsa sadece fiyatı yazar
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
    // Placeholder servisi sende çalışmadığı için güvenli bir SVG ikonu kullanıyoruz
    const safeFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";

    if (!link || link.trim() === "") return safeFallback;

    try {
        // Linkten temiz domaini al (Örn: boyner.com.tr)
        const urlObj = new URL(link);
        const domain = urlObj.hostname.replace('www.', '');
        
        // Clearbit yerine Google'ın çok daha stabil ve hızlı olan logo servisini kullanıyoruz
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
        // Resim yoksa logo çekiciyi çalıştır
        const displayImg = f.image_url || getPlaceholderImage(f.link);
        
        // Kategoriye göre renk belirleme (index.html ile uyumlu)
        const isOnline = f.category === 'Online Ürün & Kampanya';
        const borderColor = isOnline ? '#007bff' : '#28a745';

        return `
        <div class="cyber-card ad-card" style="margin-bottom:15px; cursor:pointer; border-left: 5px solid ${borderColor};" onclick="openFirsatDetail('${f.id}')">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <span style="font-size:0.6rem; font-weight:bold; text-transform:uppercase; background:#eee; padding:2px 5px; border-radius:3px;">${f.category}</span>
                <button onclick="event.stopPropagation(); deleteFirsat('${f.id}', '${f.delete_password}')" style="background:none; border:none; color:#ff4d4d; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
            <h4 style="margin:5px 0;">${f.title}</h4>

          
               <img src="${displayImg}" 
     onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23ccc%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2210%22%3E%3C/circle%3E%3Cline x1=%2212%22 y1=%228%22 x2=%2212%22 y2=%2212%22%3E%3C/line%3E%3Cline x1=%2212%22 y1=%2216%22 x2=%2212.01%22 y2=%2216%22%3E%3C/line%3E%3C/svg%3E';"
     style="width:100%; height:150px; object-fit:contain; background:#f9f9f9; border-radius:8px; margin:5px 0; padding:10px;">

            <p style="font-size:0.8rem; color:#444; margin-top:5px; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.content}</p>
        </div>`;
    }).join('') || "";
}
window.openFirsatDetail = async function(id) {
    try {
        const { data: f, error } = await window.supabase.from('firsatlar').select('*').eq('id', id).single();
        if (error || !f) return;

        const dateStr = new Date(f.created_at).toLocaleDateString('tr-TR', {day:'2-digit', month:'2-digit', year:'numeric'});

        // BAŞLIK VE FİYAT
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
                // Kullanıcı resim eklediyse: Siyah zemin ve tam resim
                gallery.style.background = "#000"; 
                gallery.innerHTML = images.map(src => `<img src="${src}" style="width:100%; margin-bottom:12px; border-radius:10px;">`).join('');
            } else {
                // SADECE LOGO VARSA: Temiz beyaz zemin ve ortalanmış logo (Şık görünümü sağlayan yer)
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
    const { data } = await window.supabase.from('tavsiyeler').select('*').order('created_at', {ascending: false});
    el.innerHTML = data?.map(item => `
        <div class="cyber-card" style="margin-bottom:15px; border-bottom:1px solid #eee;">
            <div style="display:flex; justify-content:space-between;">
                <strong>${item.title}</strong>
                <span>${"⭐".repeat(item.rating || 5)}</span>
            </div>
            ${item.image_url ? `<img src="${item.image_url}" style="width:100%; border-radius:8px; margin:10px 0; max-height:200px; object-fit:cover;">` : ''}
            <p style="margin:8px 0; font-style:italic;">"${item.comment}"</p>
            <div style="text-align:right;">
                <button onclick="deleteTavsiye('${item.id}', '${item.delete_password}')" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:0.8rem;">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `).join('') || "";
}

async function renderSikayetler() {
    const el = document.getElementById('complaint-list');
    if (!el) return;
    const { data } = await window.supabase.from('sikayetler').select('*').order('created_at', {ascending: false});
    
    el.innerHTML = data?.map(i => `
        <div class="cyber-card" style="margin-bottom:15px; border-left: 5px solid #ff4d4d;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <span style="font-size:0.7rem; font-weight:bold; background:#ffebee; color:#c62828; padding:2px 6px; border-radius:4px;">${i.category}</span>
                <button onclick="deleteSikayet('${i.id}', '${i.delete_password}')" style="background:none; border:none; color:#999; cursor:pointer;"><i class="fas fa-trash"></i></button>
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

window.deleteFirsat = async (id, correctPass) => {
    const userPass = prompt("Şifrenizi girin:");
    if (userPass === correctPass) {
        await window.supabase.from('firsatlar').delete().eq('id', id);
        renderFirsatlar();
    } else if (userPass !== null) alert("Hatalı!");
};

window.deleteTavsiye = async (id, correctPass) => {
    const userPass = prompt("Şifre:");
    if (userPass === correctPass) {
        await window.supabase.from('tavsiyeler').delete().eq('id', id);
        loadPortalData();
    }
};

window.deleteSikayet = async (id, correctPass) => {
    const userPass = prompt("Şikayeti silmek için şifre girin:");
    if (userPass === correctPass) {
        const { error } = await window.supabase.from('sikayetler').delete().eq('id', id);
        if (!error) {
            alert("Şikayet kaldırıldı.");
            loadPortalData();
        }
    } else if (userPass !== null) alert("Hatalı şifre!");
};

async function fetchAndRenderAds() {
    const list = document.getElementById("ads-list");
    if (!list) return;
    const { data } = await window.supabase.from('ilanlar').select('*').order('created_at', {ascending: false});
    allAds = data || [];
    
    // İlanlar yüklendikten sonra mevcut filtreleri uygula
    const searchInput = document.getElementById("ad-search-input");
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    applyFilters(currentCategory, searchTerm);
}

window.openAdDetail = function(id) {
    const ad = allAds.find(a => a.id == id);
    if (!ad) return;

    document.getElementById("modal-title").textContent = ad.title;
    document.getElementById("modal-price").textContent = ad.price + " TL";
    
    // İletişim bilgisi ekle
    const descriptionEl = document.getElementById("modal-description");
    if (ad.contact) {
        // Güvenli şekilde HTML escape edilmiş içerik
        const contentEscaped = ad.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        const contactEscaped = ad.contact.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        descriptionEl.innerHTML = contentEscaped + `<br><br><strong style="color:#007bff;"><i class="fas fa-phone"></i> İletişim:</strong> ${contactEscaped}`;
    } else {
        descriptionEl.textContent = ad.content;
    }

    // Görsel galerisi (varsa 3 resim)
  const gallery = document.getElementById("modal-image-gallery");
if (gallery) {
    const images = [ad.image_url, ad.image_url_2, ad.image_url_3].filter(Boolean);

    gallery.innerHTML = images.length
        ? images.map(src => `
            <img src="${src}" alt="İlan görseli">
        `).join('')
        : '';
}


    // SATIN ALMA BUTONU - İletişim bilgisini göster/kopyala
    document.getElementById("modal-buy-btn").onclick = () => {
        if (ad.contact) {
            const copyText = ad.contact;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(copyText).then(() => {
                    alert("İletişim bilgisi panoya kopyalandı: " + copyText);
                });
            } else {
                alert("İletişim Bilgisi: " + copyText);
            }
        } else {
            alert("Bu ilanda iletişim bilgisi bulunmuyor.");
        }
    };

    // SİLME BUTONU AYARI
    document.getElementById("modal-delete-btn-inner").onclick = () => {
        const userPass = prompt("Bu ilanı silmek için 4 haneli şifrenizi girin:");
        if (userPass === null) return;
        if (userPass !== ad.delete_password) {
            alert("Hatalı şifre!");
            return;
        }
        window.supabase
            .from('ilanlar')
            .delete()
            .eq('id', ad.id)
            .then(({ error }) => {
                if (error) {
                    alert("Silme işlemi sırasında hata oluştu: " + error.message);
                } else {
                    alert("İlan başarıyla silindi.");
                    document.getElementById("ad-detail-modal").style.display = "none";
                    loadPortalData();
                }
            });
    };

    document.getElementById("ad-detail-modal").style.display = "block";
};

// Modal kapatma işlevleri
const closeModal = () => {
    document.getElementById("ad-detail-modal").style.display = "none";
};

document.querySelector(".close-detail").onclick = closeModal;

// Modal dışına tıklanınca kapat
document.getElementById("ad-detail-modal").addEventListener("click", (e) => {
    if (e.target.id === "ad-detail-modal") {
        closeModal();
    }
});

/* >> GELİŞMİŞ DASHBOARD GÜNCELLEME MOTORU << */
async function updateDashboard() {
    try {
        // 1. Son İlanı Al
        const { data: lastAd } = await window.supabase.from('ilanlar').select('title').order('created_at', {ascending: false}).limit(1);
        if (lastAd && lastAd[0]) document.getElementById("preview-ad").textContent = lastAd[0].title;

        // 2. Son Kesintiyi Al
        const { data: lastKesinti } = await window.supabase.from('kesintiler').select('location, type').order('created_at', {ascending: false}).limit(1);
        if (lastKesinti && lastKesinti[0]) {
            document.getElementById("preview-kesinti").textContent = `${lastKesinti[0].type}: ${lastKesinti[0].location}`;
        }

        // 3. Son Öğrenci İlanını Al
        const { data: lastOgrenci } = await window.supabase.from('ogrenciler').select('title').order('created_at', {ascending: false}).limit(1);
        if (lastOgrenci && lastOgrenci[0]) document.getElementById("preview-ogrenci").textContent = lastOgrenci[0].title;

        // 4. Son Fırsatı Al
        const { data: lastFirsat } = await window.supabase.from('firsatlar').select('title').order('created_at', {ascending: false}).limit(1);
        if (lastFirsat && lastFirsat[0]) document.getElementById("preview-firsat").textContent = lastFirsat[0].title;

    } catch (err) {
        console.error("Dashboard güncelleme hatası:", err.message);
    }
}

function showSlides() {
    let slides = document.getElementsByClassName("slider-item");
    if (!slides.length) return;
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) slideIndex = 1;
    // Tasarımla uyumlu olması için flex kullanıyoruz
    slides[slideIndex - 1].style.display = "flex"; 
    setTimeout(showSlides, 4000);
}

/* >> DUYURU RENDER MOTORU << */
async function renderDuyurular() {
    const previewEl = document.getElementById('preview-duyuru'); 
    if (!previewEl) return;

    const { data, error } = await window.supabase
        .from('duyurular')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1); // Sadece en son duyuruyu al

    if (error) {
        console.error("Duyuru çekme hatası:", error.message);
        previewEl.textContent = "Duyuru yüklenemedi.";
        return;
    }

    if (data && data.length > 0) {
        // Dashboard'daki pembe "YÜKLENİYOR..." yazısını günceller
        previewEl.textContent = data[0].title;
    } else {
        previewEl.textContent = "Aktif duyuru bulunmuyor.";
    }
}

/* >> ÖĞRENCİ YARDIMLAŞMA MOTORU << */
async function setupStudentForm() {
    const form = document.getElementById("student-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isProcessing) return;

        const btn = document.getElementById("stu-submit-btn");
        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "İŞLENİYOR...";

        try {
            const fileInput = document.getElementById("stu-file");
            let uploadedUrl = null;

            if (fileInput.files.length > 0) {
                let urls = await handleMultipleUploads(fileInput.files);
                uploadedUrl = urls[0];
            }

            const payload = {
                category: document.getElementById("stu-category").value,
                title: document.getElementById("stu-title").value,
                content: document.getElementById("stu-content").value,
                image_url: uploadedUrl,
                delete_password: document.getElementById("stu-pass").value
            };

            const { error } = await window.supabase.from('ogrenciler').insert([payload]);
            if (error) throw error;

            alert("Öğrenci ilanı başarıyla yayınlandı!");
            form.reset();
            renderStudents();
        } catch (err) {
            alert("Hata: " + err.message);
        } finally {
            isProcessing = false;
            btn.disabled = false;
            btn.textContent = "YAYINLA";
        }
    });
}

async function renderStudents() {
    const el = document.getElementById('student-list');
    if (!el) return;

    const { data } = await window.supabase.from('ogrenciler').select('*').order('created_at', { ascending: false });

    el.innerHTML = data?.map(s => `
        <div class="cyber-card" style="margin-bottom:15px; border-top: 4px solid #6f42c1; border-left: none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="student-badge">${s.category}</span>
                <button onclick="deleteStudent('${s.id}', '${s.delete_password}')" style="background:none; border:none; color:#999;"><i class="fas fa-times"></i></button>
            </div>
            <h4 style="margin:5px 0;">${s.title}</h4>
            ${s.image_url ? `<img src="${s.image_url}" style="width:100%; border-radius:8px; margin:8px 0;">` : ''}
            <p style="font-size:0.9rem; color:#444;">${s.content}</p>
            <div style="text-align:right; font-size:0.6rem; color:#aaa; margin-top:8px;">${new Date(s.created_at).toLocaleDateString('tr-TR')}</div>
        </div>
    `).join('') || "<p style='text-align:center;'>Henüz bir ilan yok.</p>";
}

window.deleteStudent = async (id, correctPass) => {
    const userPass = prompt("Silmek için şifrenizi girin:");
    if (userPass === correctPass) {
        await window.supabase.from('ogrenciler').delete().eq('id', id);
        renderStudents();
    } else if (userPass !== null) alert("Hatalı şifre!");
};

/* >> KESİNTİ BİLDİRİM MOTORU << */
async function setupKesintiForm() {
    const form = document.getElementById("kesinti-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isProcessing) return;

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

/* >> YASAL METİNLER VE İLETİŞİM YÖNETİMİ << */
window.showLegal = function(type) {
    const area = document.getElementById('legal-content-area');
    const contents = {
        about: `
            <h3>🎓 Hakkımızda</h3>
            <p><b>Bahçelievler Forum</b>, semt sakinleri arasında dayanışmayı artırmak, yerel ticareti desteklemek ve güncel mahalle duyurularını tek merkezden toplamak amacıyla kurulmuş dijital bir mahalle platformudur.</p>
            <p>Tamamen gönüllülük esasıyla çalışan bu yapı, semt kültürünü dijital dünyaya taşımayı hedefler.</p>
        `,
        disclaimer: `
            <h3>⚖️ Sorumluluk Reddi (Disclaimer)</h3>
            <p>1. <b>İçerik Sorumluluğu:</b> Platformda paylaşılan ilanlar, yorumlar, tavsiyeler ve şikayetlerin içeriğinden doğrudan paylaşımı yapan kullanıcı sorumludur. Bahçelievler Forum, içeriğin doğruluğunu garanti etmez.</p>
            <p>2. <b>Ticari İlişkiler:</b> Kullanıcılar arasında gerçekleşen alışveriş, hizmet alımı veya randevularda oluşabilecek maddi/manevi zararlardan platformumuz sorumlu tutulamaz.</p>
            <p>3. <b>Dış Bağlantılar:</b> Sitede yer alan üçüncü taraf linkleri (Oyunlar, ISP haritaları vb.) harici servislerdir; bu sitelerin içeriklerinden ve veri politikalarından sorumlu değiliz.</p>
        `,
        kvkk: `
            <h3>🛡️ KVKK Aydınlatma Metni</h3>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca verileriniz şu kapsamda işlenmektedir:</p>
            <ul>
                <li><b>Toplanan Veriler:</b> İlan paylaşımı sırasında verdiğiniz e-posta adresi, paylaşılan görseller, IP adresi ve oluşturduğunuz 4 haneli silme şifresi.</li>
                <li><b>İşleme Amacı:</b> İlan güvenliğinin sağlanması, kötü niyetli kullanımın (küfür, hakaret, dolandırıcılık) önlenmesi ve teknik hataların tespiti.</li>
                <li><b>Veri Aktarımı:</b> Verileriniz, sadece adli makamların resmi talebi doğrultusunda ilgili mercilerle paylaşılır; üçüncü taraflara pazarlama amacıyla satılmaz.</li>
                <li><b>Haklarınız:</b> İlanınızı şifrenizle silerek verinizi platformdan her an kaldırabilirsiniz. Veri silme talepleri için iletişim formunu kullanabilirsiniz.</li>
            </ul>
        `,
        sss: `
            <h3>❓ Sıkça Sorulan Sorular</h3>
            <div style="margin-top:10px; text-align:left;">
                <p><b>1. Paylaştığım bir içeriği nasıl silebilirim?</b><br>
                İçeriği eklerken belirlediğiniz 4 haneli şifreyi kullanarak, içeriğin altındaki "Sil" butonuna basıp işlemi tamamlayabilirsiniz.</p>
                <hr style="opacity:0.1; margin:10px 0;">
                <p><b>2. Şifremi unuttum, ne yapmalıyım?</b><br>
                Güvenlik gereği şifreler sistemde korunmaktadır. Silme işlemleri için "Bize Yazın" kısmından ilgili başlığı belirterek destek isteyebilirsiniz.</p>
                <hr style="opacity:0.1; margin:10px 0;">
                <p><b>3. Hizmet tanıtımı veya ilan vermek ücretli mi?</b><br>
                Hayır, Bahçelievler Forum üzerindeki tüm temel özellikler semt sakinlerimiz için tamamen ücretsizdir.</p>
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

// İletişim Formu Başlatıcı (Kurumsal Alan İçin)
function setupContactForm() {
    const form = document.getElementById('contact-form');
    if(!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isProcessing) return;
        
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

/* >> CANLI VERİ ÇEKİCİ MOTORU << */
async function fetchLiveInfo() {
    // 1. Canlı Hava Durumu (Open-Meteo - API KEY Gerektirmez)
    try {
        const wRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=41.00&longitude=28.84&current_weather=true");
        const wData = await wRes.json();
        const temp = Math.round(wData.current_weather.temperature);
        document.getElementById("weather-temp").textContent = `Bahçelievler: ${temp}°C`;
    } catch (e) { document.getElementById("weather-temp").textContent = "Hava: --"; }

    // 2. Canlı Kur Bilgisi
    try {
        const simpleRes = await fetch("https://open.er-api.com/v6/latest/USD");
        const sData = await simpleRes.json();
        
        const usdToTry = (sData.rates.TRY).toFixed(2);
        const eurToTry = (sData.rates.TRY / sData.rates.EUR).toFixed(2);

        document.getElementById("usd-rate").textContent = usdToTry + " ₺";
        document.getElementById("eur-rate").textContent = eurToTry + " ₺";
    } catch (e) { console.error("Kur çekilemedi"); }
}

/* >> İLAN ARAMA VE FİLTRELEME SİSTEMİ << */
function setupAdSearch() {
    const searchInput = document.getElementById("ad-search-input");
    if (!searchInput) return;
    
    // Anlık arama - her tuş vuruşunda filtrele
    searchInput.addEventListener("input", (e) => {
        applyFilters(currentCategory, e.target.value.trim());
    });
    
    // Enter tuşuna basıldığında da filtrele (opsiyonel)
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
    
    // 1. Kategoriye göre filtrele
    if (category !== 'all') {
        filtered = filtered.filter(ad => ad.category === category);
    }
    
    // 2. Arama terimine göre filtrele (başlıkta ara)
    if (searchTerm && searchTerm.length > 0) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(ad => {
            const titleLower = (ad.title || '').toLowerCase();
            return titleLower.includes(searchLower);
        });
    }
    
    // Sonuçları göster
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
                    <div style="font-weight:bold; font-size:1.1rem; color:var(--dark); margin:2px 0;">${ad.price} TL</div>
                    <div style="font-size:0.85rem; color:#444; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${ad.title}</div>
                </div>
            </div>
        `).join('');
    }
}

window.filterAds = function(category, clickedButton) {
    // Buton aktiflik durumu
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // Mevcut kategoriyi güncelle
    currentCategory = category;
    
    // Arama terimini al
    const searchInput = document.getElementById("ad-search-input");
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    // Filtreleri uygula
    applyFilters(category, searchTerm);
};

window.searchOnMap = function() {
    const query = document.getElementById('map-search-input').value;
    if (!query) return alert("Lütfen aramak istediğiniz usta türünü yazın.");
    
    const mapIframe = document.getElementById('target-map');
    
    // Google Maps Embed (Stabil ve ücretsiz format)
    const freeSearchUrl = `https://www.google.com/search?q=https://maps.google.com/maps%3Fq%3D${encodeURIComponent(query)}+Bahçelievler+İstanbul&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    
    mapIframe.src = freeSearchUrl;
};


/* >> HİZMET TANITIM MOTORU - GÖRSEL ZORUNLULUĞU V1.1 << */
async function setupHizmetForm() {
    const form = document.getElementById("hizmet-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isProcessing) return;

        const fileInput = document.getElementById("hizmet-file");
        const btn = document.getElementById("hizmet-submit-btn");

        // --- MANTIK KONTROLÜ: GÖRSEL ZORUNLULUĞU --- [cite: 2025-12-16]
        if (!fileInput.files || fileInput.files.length === 0) {
            alert("HATA: Hizmetinizi tanıtmak için lütfen bir görsel ekleyiniz.");
            fileInput.focus();
            return; // Resim yoksa burada durdur
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
            // Görseli yükle
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
    if (userPass === correctPass) {
        await window.supabase.from('hizmetler').delete().eq('id', id);
        renderHizmetler();
    } else if (userPass !== null) alert("Hatalı şifre!");
};