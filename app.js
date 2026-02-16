/* ===== TAVSİYE DELETE EVENT ===== */

const socialDeleteBtn = document.getElementById("social-delete-btn");

if (socialDeleteBtn) {

    socialDeleteBtn.addEventListener("click", async function () {

        const tavsiyeId = this.getAttribute("data-id");
        if (!tavsiyeId) return;

        if (!confirm("Bu içeriği kaldırmak istiyor musunuz?")) return;

        const { error } = await window.supabase
            .from("tavsiyeler")
            .delete()
            .eq("id", tavsiyeId);

        if (error) {
            alert(error.message);
            return;
        }

        alert("İçerik kaldırıldı.");
        closeSocialModal();
        await renderTavsiyeler();

    });

}
