<template>
  <button class="button" type="button">
    <span class="button-content">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.button {
  position: relative;
  isolation: isolate;
  min-width: 106px;
  height: 44px;
  display: inline-grid;
  place-items: center;
  padding: 0 17px;
  border: 3px solid #073365;
  border-radius: 14px;
  color: #ffffff;
  background: #0d6fbd;
  box-shadow:
    0 0 0 1px rgba(92, 190, 255, 0.58),
    inset 0 0 0 3px #f6fbff,
    inset 0 -2px 0 rgba(0, 48, 118, 0.42),
    0 2px 0 rgba(0, 27, 67, 0.68);
  cursor: pointer;
  font-family: "Backpack Tab Qingke";
  font-size: 25px;
  font-weight: 400;
  line-height: 1;
  user-select: none;
}

.button::before {
  content: "";
  position: absolute;
  inset: 6px 6px 5px;
  z-index: 0;
  border-radius: 9px;
  background:
    linear-gradient(180deg, #6de2ff 0%, #37b5fb 35%, #0b82de 66%, #0559ad 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -7px 0 rgba(4, 68, 160, 0.4);
}

.button::after {
  content: "";
  position: absolute;
  top: 7px;
  left: 10px;
  right: 10px;
  z-index: 1;
  height: 18px;
  border-radius: 8px 8px 62% 50% / 8px 8px 11px 8px;
  background:
    radial-gradient(82% 20px at 33% 3px, rgba(242, 255, 255, 0.96) 0%, rgba(174, 241, 255, 0.7) 51%, rgba(90, 210, 255, 0.14) 100%),
    linear-gradient(180deg, rgba(213, 252, 255, 0.65) 0%, rgba(101, 219, 255, 0.3) 69%, rgba(0, 128, 221, 0) 100%);
  pointer-events: none;
}

.button-content {
  position: relative;
  z-index: 2;
  display: block;
  transform: translateY(0) scale(1);
  transform-origin: center;
  text-shadow:
    0 2px 0 #064c9c,
    1px 0 0 #064c9c,
    -1px 0 0 #064c9c,
    0 -1px 0 #064c9c;
  white-space: nowrap;
}

.button:hover,
.button:focus-visible {
  filter: brightness(1.08);
  outline: 0;
}

.button:hover::before,
.button:focus-visible::before {
  background:
    linear-gradient(0deg, #6de2ff 0%, #37b5fb 35%, #0b82de 66%, #0559ad 100%);
  box-shadow:
    inset 0 -1px 0 rgba(255, 255, 255, 0.78),
    inset 0 7px 0 rgba(4, 68, 160, 0.32);
}

.button:hover::after,
.button:focus-visible::after {
  top: auto;
  bottom: 7px;
  height: 17px;
  border-radius: 54% 46% 8px 8px / 8px 10px 8px 8px;
  background:
    radial-gradient(82% 19px at 34% calc(100% - 3px), rgba(242, 255, 255, 0.9) 0%, rgba(174, 241, 255, 0.62) 51%, rgba(90, 210, 255, 0.1) 100%),
    linear-gradient(0deg, rgba(213, 252, 255, 0.55) 0%, rgba(101, 219, 255, 0.24) 68%, rgba(0, 128, 221, 0) 100%);
}

.button:hover .button-content,
.button:focus-visible .button-content {
  transform: translateY(0) scale(1.08);
}
</style>
