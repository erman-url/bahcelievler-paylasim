/* >> BAHÇELİEVLER PRO ENGINE V3.5 - STABİLİZE EDİLMİŞ TAM SÜRÜM << */
let slideIndex = 0;
let allAds = [];
let isProcessing = false; 

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
    loadPortalData();
    fetchLiveInfo();
	fetchPharmacies(); // Eczaneleri yükle
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
    const navItems = document.querySelectorAll(".nav-item, .cyber-btn-block, .home-widget");
    navItems.forEach(item => {
        item.addEventListener("click", e => {
            const target = item.getAttribute("data-target");
            if (!target) return;

            // Eğer href bir dış bağlantı değilse portal içi geçiş yap
            const href = item.getAttribute("href");
            if (!href || href === "#") {
                e.preventDefault();
                document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
                const targetPage = document.getElementById(target);
                if (targetPage) targetPage.classList.add("active");
                window.scrollTo(0, 0);
                document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
                const activeLink = document.querySelector(`.nav-item[data-target="${target}"]`);
                if (activeLink) activeLink.classList.add("active");
            }
        });
    });
}

/* >> TEKLİF ALMA SİSTEMİ MOTORU << */
async function setupQuoteForm() {
    const quoteForm = document.getElementById("quote-request-form");
    if (!quoteForm) return;

    quoteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isProcessing) return; 

        const btn = document.getElementById("quote-submit-btn");
        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "İŞLENİYOR...";

        try {
            const fileInput = document.getElementById("quote-file");
            let uploadedImageUrl = null;

            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                if (file.size > 5 * 1024 * 1024) {
                    alert("Görsel boyutu 5MB'dan büyük olamaz.");
                    throw new Error("Boyut hatası");
                }
                const fileName = `teklif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                const { data, error: storageError } = await window.supabase.storage
                    .from('ilanlar')
                    .upload(fileName, file);
                
                if (storageError) throw storageError;
                const { data: urlData } = window.supabase.storage.from('ilanlar').getPublicUrl(fileName);
                uploadedImageUrl = urlData.publicUrl;
            }

            const payload = {
                category: document.getElementById("quote-category").value,
                talep_metni: document.getElementById("quote-text").value,
                email: document.getElementById("quote-email").value,
                image_url: uploadedImageUrl
            };

            const { error: dbError } = await window.supabase.from('teklifal').insert([payload]);
            if (dbError) throw dbError;

            const emailParams = {
                name: `Teklif: ${payload.category}`,
                email: payload.email,
                message: `Talep Detayı: ${payload.talep_metni}\nGörsel: ${uploadedImageUrl || 'Yok'}`,
                title: "Yeni Teklif Talebi"
            };

            await emailjs.send('service_hdlldav', 'template_1qzuj7s', emailParams);

            alert("Talebiniz alınmıştır.");
            quoteForm.reset();
            document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
            document.getElementById("hizmetler").classList.add("active");

        } catch (err) {
            if (err.message !== "Boyut hatası") alert("Hata: " + err.message);
        } finally {
            isProcessing = false;
            btn.disabled = false;
            btn.textContent = "GÖNDER";
        }
    });
}

/* >> İLAN SİSTEMİ: RESİM YÜKLEME MOTORU << */
async function handleMultipleUploads(files) {
    if (!files || files.length === 0) return [];
    let urls = [];
    const MAX_SIZE = 5 * 1024 * 1024;
    const filesArray = Array.from(files).slice(0, 3);

    for (let file of filesArray) {
        if (file.size > MAX_SIZE) {
            alert(`"${file.name}" çok büyük. Lütfen 5MB altı bir resim seçin.`);
            continue;
        }
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        try {
            const { data, error } = await window.supabase.storage
                .from('ilanlar')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });
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
            btn.textContent = "YAYINLANIYOR...";

            try {
                const fileInput = document.getElementById("ads-files");
                let urls = await handleMultipleUploads(fileInput.files);

                const { error } = await window.supabase.from('ilanlar').insert([{
                    title: titleVal,
                    price: priceVal,
                    category: document.getElementById("ad-category").value,
                    content: contentVal,
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

        const payload = {
            title: document.getElementById("rec-title").value,
            comment: document.getElementById("rec-content").value,
            rating: parseInt(document.getElementById("rec-rating").value),
            delete_password: document.getElementById("rec-pass").value,
            category: "Genel"
        };

        const { error } = await window.supabase.from('tavsiyeler').insert([payload]);
        if (!error) { alert("Eklendi!"); e.target.reset(); loadPortalData(); }
        isProcessing = false;
        btn.disabled = false;
    });

    document.getElementById("complaint-form")?.addEventListener("submit", async e => {
        e.preventDefault();
        if (isProcessing) return;
        
        const btn = e.target.querySelector('button');
        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "İLETİLİYOR...";

        try {
            const payload = {
                title: document.getElementById("comp-title").value,
                content: document.getElementById("comp-content").value,
                delete_password: document.getElementById("comp-pass").value,
                category: document.getElementById("comp-category") ? document.getElementById("comp-category").value : "Genel"
            };

            const { error } = await window.supabase.from('sikayetler').insert([payload]);
            if (error) throw error;

            alert("Şikayetiniz başarıyla iletildi!");
            e.target.reset();
            loadPortalData();
        } catch (err) {
            alert("Hata: " + err.message);
        } finally {
            isProcessing = false;
            btn.disabled = false;
            btn.textContent = "BİLDİR";
        }
    });
}

function toggleFirsatFields() {
    const type = document.getElementById("firsat-type").value;
    const onlineDiv = document.getElementById("online-only");
    const yerelDiv = document.getElementById("yerel-only");
    
    const linkInput = document.getElementById("firsat-link");
    const descInput = document.getElementById("firsat-desc");

    if (type === "online") {
        onlineDiv.style.display = "block";
        yerelDiv.style.display = "none";
        if(linkInput) linkInput.required = true;
        if(descInput) descInput.required = false; 
    } else {
        onlineDiv.style.display = "none";
        yerelDiv.style.display = "block";
        if(linkInput) linkInput.required = false;
        if(descInput) descInput.required = true; 
    }
}

async function setupFirsatForm() {
    const form = document.getElementById("firsat-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isProcessing) return;

        const btn = document.getElementById("firsat-submit-btn");
        const type = document.getElementById("firsat-type").value;
        const files = document.getElementById("firsat-files").files;

        if (type === "yerel" && files.length === 0) {
            alert("Mağaza fırsatları için en az 1 görsel zorunludur.");
            return;
        }

        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "GÖNDERİLİYOR...";

        try {
            let urls = await handleMultipleUploads(files);
            const payload = {
                type: type,
                title: document.getElementById("firsat-title").value,
                link: type === "online" ? document.getElementById("firsat-link").value : null,
                description: type === "yerel" ? document.getElementById("firsat-desc").value : null,
                image_url: urls[0] || null,
                image_url_2: urls[1] || null,
                delete_password: document.getElementById("firsat-pass").value
            };

            const { error } = await window.supabase.from('firsatlar').insert([payload]);
            if (error) throw error;

            alert("Fırsat eklendi!");
            form.reset();
            toggleFirsatFields();
            renderFirsatlar();
        } catch (err) {
            alert("Hata: " + err.message);
        } finally {
            isProcessing = false;
            btn.disabled = false;
            btn.textContent = "FIRSAT GÖNDER";
        }
    });
}

async function renderFirsatlar() {
    const el = document.getElementById('firsat-list');
    if (!el) return;
    const { data } = await window.supabase.from('firsatlar').select('*').order('created_at', {ascending: false});
    
    el.innerHTML = data?.map(f => `
        <div class="cyber-card" style="margin-bottom:15px; border-left: 5px solid ${f.type === 'online' ? '#007bff' : '#28a745'};">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <span style="font-size:0.7rem; font-weight:bold; text-transform:uppercase;">${f.type}</span>
                <button onclick="deleteFirsat('${f.id}', '${f.delete_password}')" style="background:none; border:none; color:#ff4d4d; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
            <h4 style="margin:5px 0;">${f.title}</h4>
            ${f.image_url ? `<img src="${f.image_url}" style="width:100%; border-radius:8px; margin:5px 0;">` : ''}
            <p style="font-size:0.9rem;">${f.description || ''}</p>
            ${f.link ? `<a href="${f.link}" target="_blank" class="cyber-btn-block" style="padding:8px; font-size:0.8rem; justify-content:center; background:#f0f8ff;">Fırsata Git<i class="fas fa-external-link-alt"></i></a>` : ''}
        </div>
    `).join('') || "";
}

/* >> DİĞER FONKSİYONLAR << */
async function renderTavsiyeler() {
    const el = document.getElementById('recommend-list');
    if (!el) return;
    const { data } = await window.supabase.from('tavsiyeler').select('*').order('created_at', {ascending: false});
    el.innerHTML = data?.map(item => `
        <div class="cyber-card" onclick="deleteTavsiye('${item.id}', '${item.delete_password}')" style="margin-bottom:15px; cursor:pointer; border-left:none; border-bottom:1px solid #eee;">
            <div style="display:flex; justify-content:space-between;"><strong>${item.title}</strong><span>${"⭐".repeat(item.rating || 5)}</span></div>
            <p style="margin:8px 0; font-style:italic;">"${item.comment}"</p>
        </div>
    `).join('') || "";
}

async function renderSikayetler() {
    const el = document.getElementById('complaint-list');
    if (!el) return;
    const { data } = await window.supabase.from('sikayetler').select('*').order('created_at', {ascending: false});
    el.innerHTML = data?.map(i => `
        <div class="cyber-card" onclick="deleteSikayet('${i.id}', '${i.delete_password}')" 
             style="margin-bottom:10px; border-left: 5px solid #ff4d4d; cursor:pointer;">
            <div style="display:flex; justify-content:space-between;">
                <strong>${i.title}</strong>
                <i class="fas fa-trash" style="font-size:0.7rem; color:#ff4d4d;"></i>
            </div>
            <p style="margin:5px 0 0; font-size:0.9rem;">${i.content}</p>
            <span style="font-size:0.6rem; color:#999;">Kategori: ${i.category || 'Genel'}</span>
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
    list.innerHTML = allAds.map(ad => `
        <div class="ad-card cyber-card" onclick="openAdDetail('${ad.id}')" style="display:flex; gap:10px; align-items:center; cursor:pointer; margin-bottom:10px;">
            <img src="${ad.image_url || 'https://via.placeholder.com/60'}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
            <div style="flex:1;"><h4>${ad.title}</h4><b class="neon-text">${ad.price} TL</b></div>
            <i class="fas fa-chevron-right"></i>
        </div>`).join('');
}

window.openAdDetail = function(id) {
    const ad = allAds.find(a => a.id == id);
    if (!ad) return;
    document.getElementById("modal-title").textContent = ad.title;
    document.getElementById("modal-price").textContent = ad.price + " TL";
    document.getElementById("modal-description").textContent = ad.content;
    const gallery = document.getElementById("modal-image-gallery");
    const images = [ad.image_url, ad.image_url_2, ad.image_url_3].filter(url => url);
    gallery.style.display = images.length ? "flex" : "none";
    gallery.innerHTML = images.map(url => `<img src="${url}">`).join('');
    document.getElementById("modal-delete-btn-inner").onclick = async () => {
        const pass = prompt("Şifre:");
        if (pass === ad.delete_password) {
            await window.supabase.from('ilanlar').delete().eq('id', ad.id);
            document.getElementById("ad-detail-modal").style.display = "none";
            loadPortalData();
        }
    };
    document.getElementById("ad-detail-modal").style.display = "block";
};

document.querySelector(".close-detail").onclick = () => { document.getElementById("ad-detail-modal").style.display = "none"; };

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

        // 5. Duyuru zaten renderDuyurular içinde güncelleniyor
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

/* >> ADMIN DUYURU MOTORU << */
async function renderDuyurular() {
    const el = document.getElementById('notifications-list');
    const previewEl = document.getElementById('preview-duyuru'); 
    if (!el) return;

    const { data, error } = await window.supabase
        .from('duyurular')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Duyuru çekme hatası:", error.message);
        return;
    }

    if (data && data.length > 0) {
        if (previewEl) previewEl.textContent = data[0].title;
        el.innerHTML = data.map(item => `
            <div class="cyber-card" style="margin-bottom:20px; border-left: 5px solid ${item.type === 'Kesinti' ? '#ff4d4d' : '#00d2ff'}; padding:0; overflow:hidden;">
                ${item.image_url ? `<img src="${item.image_url}" style="width:100%; height:200px; object-fit:cover;">` : ''}
                <div style="padding:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span style="font-size:0.7rem; background:#eee; padding:3px 8px; border-radius:4px; font-weight:bold;">${item.type || 'Duyuru'}</span>
                        <span style="font-size:0.7rem; color:#999;">${new Date(item.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <h3 style="margin:0 0 10px 0; font-size:1.1rem;">${item.title}</h3>
                    <p style="margin:0; font-size:0.9rem; color:#444; line-height:1.4;">${item.content}</p>
                </div>
            </div>
        `).join('');
    } else {
        el.innerHTML = "<p style='text-align:center;'>Şu an aktif bir duyuru bulunmuyor.</p>";
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
                <hr style="opacity:0.1; margin:10px 0;">
                <p><b>4. Nöbetçi eczaneler güncel mi?</b><br>
                Evet, veriler canlı çekilmektedir. Ancak gitmeden önce eczaneyi arayarak teyit etmeniz önerilir.</p>
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
    // ID Buradaki gibi 'contact-info' ile eşleşmeli:
    message: document.getElementById("contact-info").value, 
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

    // 2. Canlı Kur Bilgisi (Yatırımım API üzerinden hızlı çekim)
    try {
        const cRes = await fetch("https://api.collectapi.com/economy/allCurrency", {
            headers: { "authorization": "apikey 5kUuIeH9E2K4Q5iI5M6h9o:0U2yD6fS8s3L7pP4j8oK" } // Geçici demo key
        });
        // Not: CollectAPI veya ücretsiz TCMB kaynakları kullanılabilir. 
        // En stabil ücretsiz yöntem için basit bir kur çekici:
        const simpleRes = await fetch("https://open.er-api.com/v6/latest/USD");
        const sData = await simpleRes.json();
        
        const usdToTry = (sData.rates.TRY).toFixed(2);
        const eurToTry = (sData.rates.TRY / sData.rates.EUR).toFixed(2);

        document.getElementById("usd-rate").textContent = usdToTry + " ₺";
        document.getElementById("eur-rate").textContent = eurToTry + " ₺";
    } catch (e) { console.error("Kur çekilemedi"); }
}
window.filterAds = function(category) {
    // Buton aktiflik durumu
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent.includes(category === 'all' ? 'TÜMÜ' : '')) btn.classList.add('active');
    });

    const list = document.getElementById("ads-list");
    const filtered = category === 'all' ? allAds : allAds.filter(ad => ad.category === category);
    
    list.innerHTML = filtered.map(ad => `
        <div class="ad-card cyber-card" onclick="openAdDetail('${ad.id}')">
            <img src="${ad.image_url || 'https://via.placeholder.com/60'}">
            <div style="flex:1;">
                <h4>${ad.title}</h4>
                <b class="neon-text">${ad.price} TL</b>
                <div style="font-size:0.6rem; color:#999;">${ad.category}</div>
            </div>
            <i class="fas fa-chevron-right"></i>
        </div>`).join('');
};

window.searchOnMap = function() {
    const query = document.getElementById('map-search-input').value;
    if (!query) return alert("Lütfen aramak istediğiniz usta türünü yazın.");
    
    const mapIframe = document.getElementById('target-map');
    
    // Google Maps Embed (Stabil ve ücretsiz format)
    const freeSearchUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}+Bahçelievler+İstanbul&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    
    mapIframe.src = freeSearchUrl;
};
/* >> HİZMET TANITIM MOTORU << */
async function setupHizmetForm() {
    const form = document.getElementById("hizmet-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isProcessing) return;

        const btn = document.getElementById("hizmet-submit-btn");
        isProcessing = true;
        btn.disabled = true;
        btn.textContent = "YÜKLENİYOR...";

        try {
            const fileInput = document.getElementById("hizmet-file");
            let uploadedUrl = null;

            if (fileInput.files.length > 0) {
                let urls = await handleMultipleUploads(fileInput.files);
                uploadedUrl = urls[0];
            }

            const payload = {
                category: document.getElementById("hizmet-category").value,
                title: document.getElementById("hizmet-firma").value, // Veritabanı uyumu için title olarak kaydediyoruz
                content: document.getElementById("hizmet-desc").value,
                image_url: uploadedUrl,
                delete_password: document.getElementById("hizmet-pass").value
            };

            // Not: Supabase üzerinde 'hizmetler' tablosu oluşturulmalıdır
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

// Silme Fonksiyonu
window.deleteHizmet = async (id, correctPass) => {
    const userPass = prompt("Silmek için şifrenizi girin:");
    if (userPass === correctPass) {
        await window.supabase.from('hizmetler').delete().eq('id', id);
        renderHizmetler();
    } else if (userPass !== null) alert("Hatalı şifre!");
};

/* >> NÖBETÇİ ECZANE SİSTEMİ MOTORU << */
window.searchOnMap = function() {
    const query = document.getElementById('map-search-input').value;
    if (!query) return alert("Lütfen aramak istediğiniz usta türünü yazın.");
    
    const mapIframe = document.getElementById('target-map');
    
    // Google Maps Embed (Stabil ve ücretsiz format)
    const freeSearchUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}+Bahçelievler+İstanbul&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    
    mapIframe.src = freeSearchUrl;
};

async function fetchPharmacies() {
    const el = document.getElementById('pharmacy-list');
    if (!el) return;

    try {
        const res = await fetch("https://api.collectapi.com/health/dutyPharmacy?ilce=Bahcelievler&il=Istanbul", {
            headers: { 
                "content-type": "application/json",
                "authorization": "apikey 5kUuIeH9E2K4Q5iI5M6h9o:0U2yD6fS8s3L7pP4j8oK" 
            }
        });
        const result = await res.json();

        if (result.success) {
            el.innerHTML = result.result.map(e => `
                <div class="cyber-card" style="margin-bottom:12px; border-left: 5px solid #ff4d4d;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:#d32f2f;">${e.name} Eczanesi</strong>
                        <a href="tel:${e.phone}" style="color:#28a745; font-size:1.2rem;"><i class="fas fa-phone-alt"></i></a>
                    </div>
                    <p style="font-size:0.85rem; margin:5px 0; color:#444;">${e.address}</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.name + ' Eczanesi Bahçelievler')}" 
                       target="_blank" class="cyber-btn-block" style="padding:5px; font-size:0.75rem; justify-content:center; background:#f8d7da; color:#721c24; border:none; text-decoration:none;">
                       <i class="fas fa-map-marker-alt"></i> HARİTADA GÖSTER
                    </a>
                </div>
            `).join('');
        } else {
            el.innerHTML = "<p style='text-align:center;'>API limiti doldu veya anahtar geçersiz.</p>";
        }
    } catch (err) {
        el.innerHTML = "<p style='color:red; text-align:center;'>Bağlantı hatası.</p>";
    }
}

// Fazlalık olan parantezleri veya yorum satırlarını buradan temizle.