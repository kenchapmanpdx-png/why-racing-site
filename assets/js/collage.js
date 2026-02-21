/**
 * WHY RACING EVENTS - Centralized Hero Collage Script
 * Dynamically populates and animates the hero collage across all interior pages.
 */

const COLLAGE_IMAGES = [
    "2 (3).jpg", "2024-5.jpg", "2025 pic 4.jpg", "2025 pic 6.jpg", "20254B.jpg",
    "20259.jpg", "20260poster.jpg", "25 pc pic 3.jpg", "25 pc pic 4.jpg", "25 race photo.jpg",
    "3 (1).jpg", "Bigfoot logo.png", "Bike 2 PDX.jpg", "Bike 5 PDX.jpg", "Bivouac Racing.jpg",
    "CCR.jpg", "Crown Stub.webp", "Final Battle to the Pacific Golden Trucker 2025.pn.png",
    "Final White River Snowshoe logo.png", "GR 2.jpg", "Hagg 4.jpg", "IMG_2017.jpg",
    "Kids 1.jpg", "MWO_6521.jpg", "NCL2025SFC (102).jpg", "NCL2025SFC (397).jpg",
    "NCL2025SFC (412).jpg", "NWABA 4.jpg", "NWABA 5.jpg", "NWABA 9.jpg", "PHOTO16.jpg",
    "RR Reel 5.jpg", "Santas Holiday Hustle.png", "Website Logos - 7 - Edited.png",
    "White Why Logo (1) (2).svg", "cc6.jpg", "couve 24d.jpg", "kids 2.jpg",
    "race_129995_235362_ba6ac8b1-f5b6-42ce-a06c-02b.jpg",
    "race_130349_204157_f6201c8a-85af-472c-8b78-f7e8a5c.jpg",
    "race_130349_239990_44342ea8-e628-4ecf-b0e0-6f8.jpg",
    "race_131095_176656_df135421-9c5d-4216-a441-a08.jpg",
    "race_131095_176656_dfc85e35-a42f-474e-ad37-62a.jpg",
    "race_131095_176657_4812806c-e026-4ea7-8002-451.jpg",
    "race_131095_209105_9f0a8dba-43ad-4f44-bf81-f4d.jpg",
    "race_131095_209105_9f3c0753-1b77-4698-a017-4ef.jpg",
    "race_131095_209105_9fd7486d-ebc2-4ead-b8f6-67f.jpg",
    "race_131095_209105_9fe95c68-b566-4d7a-9fa4-e58.jpg",
    "race_131095_209111_78a9e18b-7199-470d-8336-7a2.jpg",
    "race_131173_254538_9962b0e7-0ed2-4a03-b1ea-055.jpg",
    "race_131173_254634_281d4747-53fc-47e8-8ee2-61e.jpg",
    "race_131173_254634_28943cc6-fade-4d5b-bbea-1fa.jpg",
    "race_132516_239987_d9a85ba0-0ef9-41a4-a0b6-912.jpg",
    "race_132516_283251_89836d68-f2a8-4334-b7e9-bcc.jpg",
    "race_132516_283251_89ca57bc-5e22-457a-9632-e85.jpg",
    "race_132516_283268_c31aa265-8ec2-4083-8a02-a3e.jpg",
    "race_132768_206687_1214de41-814f-44e6-a266-e43.jpg",
    "race_132768_242714_d8c8e6c1-1214-4ebc-a4bc-b981757.jpg",
    "race_132860_269544_1f536c69-e563-4e83-987c-c9cad69.jpg",
    "race_132860_269544_1fa2a73b-9708-497f-bd97-02abdfd.jpg",
    "race_132987_264307_2a2a8021-2eb1-4a19-b36e-5420fc1.jpg",
    "race_139523_219619_e68a609a-f7b0-4fb1-9cea-b5593c5.jpg",
    "race_139523_256772_60f58e48-0c32-405e-b6d4-ba9.jpg",
    "race_139523_303442_bb5df812-b707-40f1-abc9-59f4e06.jpg",
    "race_139523_303442_bb710517-8151-48a4-a8e2-de2.jpg",
    "race_139523_303442_bb9d32ae-14e7-4e98-9398-a6b.jpg",
    "race_87827_236348_fb23e1e6-8bb1-4271-942b-1e18.jpg",
    "race_87827_236348_fb8b0871-ba3b-4fdf-b431-0f7c.jpg",
    "race_87827_236348_fbcdeb90-a6a9-458d-aa13-f4cd.jpg",
    "scary10.jpg", "scary6.jpg", "swim finish.jpg", "vanfampic.jpg"
];

function initHeroCollage() {
    const collageContainer = document.querySelector('.hero-collage');
    if (!collageContainer) return;

    // Determine how many images to show based on screen size
    // Desktop: 20 columns, usually 4-5 rows minimum = 100+ images
    // We'll aim for 160 images to ensure full coverage even on tall headers
    const targetCount = 160;
    let html = '';

    // Create a pool of images and shuffle it once for diversity
    let pool = [...COLLAGE_IMAGES];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Fill the grid
    for (let i = 0; i < targetCount; i++) {
        const imgSrc = pool[i % pool.length];
        html += `<img src="../images/collage/${imgSrc}" alt="" loading="lazy" decoding="async">`;
    }

    collageContainer.innerHTML = html;

    // Animate the reveal
    setTimeout(() => {
        const images = Array.from(collageContainer.querySelectorAll('img'));
        const shuffledImages = images.sort(() => Math.random() - 0.5);

        shuffledImages.forEach((img, index) => {
            setTimeout(() => {
                img.classList.add('revealed');
                setTimeout(() => {
                    img.classList.add('shimmering');
                }, 1200);
            }, index * 20); // Slightly faster wave for large counts
        });
    }, 100);
}

document.addEventListener('DOMContentLoaded', initHeroCollage);
