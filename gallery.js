const cardsContainerEl = document.querySelector(".cards__wrapper");

if (cardsContainerEl) {
  const buttons = {
    prev: document.querySelector(".btn--left"),
    next: document.querySelector(".btn--right"),
  };
  const appBgContainerEl = document.querySelector(".app__bg");
  const cardInfosContainerEl = document.querySelector(".info__wrapper");

  let currentIndex = 0;
  
  const cards = Array.from(cardsContainerEl.querySelectorAll(".card"));
  const infos = Array.from(cardInfosContainerEl.querySelectorAll(".info"));
  const bgs = Array.from(appBgContainerEl.querySelectorAll(".app__bg__image"));
  const totalItems = cards.length;

  buttons.next.addEventListener("click", () => swapCards("right"));
  buttons.prev.addEventListener("click", () => swapCards("left"));

  function updateClasses() {
    const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
    const nextIndex = (currentIndex + 1) % totalItems;

    cards.forEach((card, i) => {
      card.classList.remove("current--card", "previous--card", "next--card", "hidden--card");
      card.style.zIndex = i === currentIndex ? "50" : (i === prevIndex || i === nextIndex) ? "30" : "10";
      
      if (i === currentIndex) card.classList.add("current--card");
      else if (i === prevIndex) card.classList.add("previous--card");
      else if (i === nextIndex) card.classList.add("next--card");
      else card.classList.add("hidden--card");
    });

    bgs.forEach((bg, i) => {
      bg.classList.remove("current--image", "previous--image", "next--image", "hidden--image");
      bg.style.zIndex = i === currentIndex ? "-2" : "-3";

      if (i === currentIndex) bg.classList.add("current--image");
      else if (i === prevIndex) bg.classList.add("previous--image");
      else if (i === nextIndex) bg.classList.add("next--image");
      else bg.classList.add("hidden--image");
    });
  }

  function swapCards(direction) {
    let oldCurrentIndex = currentIndex;
    
    if (direction === "right") {
      currentIndex = (currentIndex + 1) % totalItems;
    } else {
      currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    }

    changeInfo(direction, oldCurrentIndex, currentIndex);
    updateClasses();
    removeCardEvents();
    initCardEvents();
  }

  function changeInfo(direction, oldIndex, newIndex) {
    let currentInfoEl = infos[newIndex];
    let previousInfoEl = infos[oldIndex];

    gsap.timeline()
      .to([buttons.prev, buttons.next], {
        duration: 0.2,
        opacity: 0.5,
        pointerEvents: "none",
      })
      .to(
        previousInfoEl.querySelectorAll(".text"),
        {
          duration: 0.4,
          stagger: 0.1,
          translateY: "-120px",
          opacity: 0,
        },
        "-="
      )
      .call(() => {
        infos.forEach((info, i) => {
          info.classList.remove("current--info", "previous--info", "next--info", "hidden--info");
          const pIdx = (currentIndex - 1 + totalItems) % totalItems;
          const nIdx = (currentIndex + 1) % totalItems;
          
          if (i === currentIndex) info.classList.add("current--info");
          else if (i === pIdx) info.classList.add("previous--info");
          else if (i === nIdx) info.classList.add("next--info");
          else info.classList.add("hidden--info");
        });
      })
      .fromTo(
        currentInfoEl.querySelectorAll(".text"),
        {
          opacity: 0,
          translateY: "40px",
        },
        {
          duration: 0.4,
          stagger: 0.1,
          translateY: "0px",
          opacity: 1,
        }
      )
      .to([buttons.prev, buttons.next], {
        duration: 0.2,
        opacity: 1,
        pointerEvents: "all",
      });
  }

  function updateCard(e) {
    // Rotation removed for a cleaner look natively handled by CSS :hover
  }

  function resetCardTransforms() {
    // Rotation removed
  }

  function initCardEvents() {
    const currentCardEl = cardsContainerEl.querySelector(".current--card");
    if (currentCardEl) {
        currentCardEl.addEventListener("pointermove", updateCard);
        currentCardEl.addEventListener("pointerout", resetCardTransforms);
    }
  }

  function removeCardEvents() {
    cards.forEach(card => {
        card.removeEventListener("pointermove", updateCard);
        card.removeEventListener("pointerout", resetCardTransforms);
    });
  }

  function init() {
    updateClasses();
    infos.forEach((info, i) => {
        if(i === 0) info.classList.add("current--info");
        else info.classList.add("hidden--info");
    });
    
    let tl = gsap.timeline();

    tl.to(cardsContainerEl.children, {
      delay: 0.15,
      duration: 0.5,
      stagger: {
        ease: "power4.inOut",
        from: "right",
        amount: 0.1,
      },
      "--card-translateY-offset": "0%",
    })
      .to(infos[currentIndex].querySelectorAll(".text"), {
        delay: 0.5,
        duration: 0.4,
        stagger: 0.1,
        opacity: 1,
        translateY: 0,
      })
      .to(
        [buttons.prev, buttons.next],
        {
          duration: 0.4,
          opacity: 1,
          pointerEvents: "all",
        },
        "-=0.4"
      );
      
    initCardEvents();
  }

  const waitForImages = () => {
    const images = Array.from(document.querySelectorAll(".app__bg__image img, .card__image img"));
    const totalImages = images.length;
    let loadedImages = 0;
    const loaderEl = document.querySelector(".loader span");

    gsap.set(cardsContainerEl.children, {
      "--card-translateY-offset": "100vh",
    });
    
    infos.forEach(i => gsap.set(i.querySelectorAll(".text"), { translateY: "40px", opacity: 0 }));
    
    gsap.set([buttons.prev, buttons.next], {
      pointerEvents: "none",
      opacity: "0",
    });

    if (totalImages === 0) {
        init();
        return;
    }

    images.forEach((image) => {
      imagesLoaded(image, (instance) => {
        if (instance.isComplete) {
          loadedImages++;
          let loadProgress = loadedImages / totalImages;

          if (loaderEl) {
              gsap.to(loaderEl, {
                duration: 1,
                scaleX: loadProgress,
                backgroundColor: `var(--arcane-hex)`,
              });
          }

          if (totalImages === loadedImages) {
            gsap.timeline()
              .to(".loading__wrapper", {
                duration: 0.8,
                opacity: 0,
                pointerEvents: "none",
              })
              .call(() => init());
          }
        }
      });
    });
  };

  waitForImages();
}
