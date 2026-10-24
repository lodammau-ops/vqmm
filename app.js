const spinNowButton = document.querySelector("#spin-now-button");
const statusMessage = document.querySelector("#status");
const wheel = document.querySelector("#wheel");
const bulbRing = document.querySelector("#bulb-ring");
const winCard = document.querySelector("#win-card");
const winPrize = document.querySelector("#win-prize");
const confetti = document.querySelector("#confetti");

const bulbCount = 32;
for (let index = 0; index < bulbCount; index += 1) {
  const angle = (index / bulbCount) * Math.PI * 2 - Math.PI / 2;
  const bulb = document.createElement("span");
  bulb.className = "bulb";
  bulb.style.left = `${50 + Math.cos(angle) * 50}%`;
  bulb.style.top = `${50 + Math.sin(angle) * 50}%`;
  bulb.style.setProperty("--delay", `${index * -0.025}s`);
  bulbRing.append(bulb);
}

const prizes = [
  { id: "voucher", name: "Voucher 49.000đ", angle: 45 },
  { id: "bim-bim", name: "1 gói Bim Bim", angle: 135 },
  { id: "banh-tam-xoan", name: "1 gói Bánh Tăm Xoắn", angle: 225 },
  { id: "o-mai-man", name: "1 gói Ô Mai Mận", angle: 315 },
];

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function showWin(prizeName) {
  winPrize.textContent = prizeName;
  winCard.hidden = false;
  winCard.classList.remove("is-visible");
  void winCard.offsetWidth;
  winCard.classList.add("is-visible");
  winCard.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "center",
  });

  confetti.replaceChildren();
  const colors = ["#fff0a6", "#ffd34d", "#ff755e", "#fff9e5", "#73e0c0", "#ff9c39"];
  for (let index = 0; index < 34; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    piece.style.setProperty("--confetti-x", `${Math.round(Math.random() * 300 - 150)}px`);
    piece.style.setProperty("--confetti-y", `${Math.round(Math.random() * 100 - 35)}px`);
    piece.style.setProperty("--confetti-rotate", `${Math.round(Math.random() * 900 - 450)}deg`);
    piece.style.setProperty("--confetti-delay", `${Math.random() * 0.2}s`);
    confetti.append(piece);
  }
}

function spinToPrize(prizeAngle) {
  const matrix = new DOMMatrixReadOnly(getComputedStyle(wheel).transform);
  const currentAngle = (Math.atan2(matrix.b, matrix.a) * 180 / Math.PI + 360) % 360;
  wheel.style.transform = `rotate(${currentAngle}deg)`;
  wheel.classList.remove("is-idle");
  void wheel.offsetWidth;

  const edgeOffset = 34 + Math.random() * 9;
  const direction = Math.random() < 0.5 ? -1 : 1;
  const desiredRotation = (360 - prizeAngle + direction * edgeOffset + 360) % 360;
  const alignment = (desiredRotation - currentAngle + 360) % 360;
  const totalRotation = currentAngle + 9 * 360 + alignment;

  return new Promise((resolve) => {
    let fallbackTimer;
    const finish = () => {
      clearTimeout(fallbackTimer);
      wheel.removeEventListener("transitionend", onTransitionEnd);
      bulbRing.classList.remove("is-spinning");
      bulbRing.classList.add("is-winner");
      setTimeout(() => bulbRing.classList.remove("is-winner"), 1800);
      resolve();
    };
    const onTransitionEnd = (event) => {
      if (event.target === wheel && event.propertyName === "transform") finish();
    };

    bulbRing.classList.remove("is-winner");
    bulbRing.classList.add("is-spinning");
    wheel.addEventListener("transitionend", onTransitionEnd);
    fallbackTimer = setTimeout(finish, 8500);
    wheel.style.transform = `rotate(${totalRotation}deg)`;
  });
}

wheel.classList.add("is-idle");
bulbRing.classList.add("is-idle");

spinNowButton.addEventListener("click", async () => {
  const prize = prizes[Math.floor(Math.random() * prizes.length)];
  spinNowButton.disabled = true;
  winCard.hidden = true;
  winCard.classList.remove("is-visible");
  setStatus("");

  try {
    await spinToPrize(prize.angle);
    showWin(prize.name);
    setStatus(`Chúc mừng bạn nhận được: ${prize.name}!`);
  } catch {
    setStatus("Không thể hoàn tất hiệu ứng vòng quay. Vui lòng thử lại.", true);
  } finally {
    spinNowButton.disabled = false;
  }
});
