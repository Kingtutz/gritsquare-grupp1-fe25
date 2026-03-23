export const showAdVideo = () => {
    const overlay = document.createElement("div");
    overlay.classList.add("ad-overlay");

    const container = document.createElement("div");
    container.classList.add("ad-container");

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Stäng";
    closeBtn.disabled = true;
    closeBtn.onclick = () => overlay.remove();

    const video = document.createElement("video");
    video.src = "https://www.w3schools.com/html/mov_bbb.mp4";
    video.controls = true;
    video.autoplay = true;
    video.width = 400;

    video.addEventListener("ended", () => closeBtn.disabled = false);

    container.append(video, closeBtn);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

};