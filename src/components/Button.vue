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
  min-width: 96px;
  height: 46px;
  display: inline-grid;
  place-items: center;
  padding: 0 8px;
  border: 4px solid #07518f;
  border-radius: 17px;
  color: #ffffff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.44) 44%, transparent 45%),
    linear-gradient(180deg, #8ecbff 0%, #4aa7ee 52%, #1377d2 100%);
  box-shadow:
    inset 0 0 0 2px #ffffff,
    inset 0 3px 0 rgba(255, 255, 255, 0.36),
    inset 0 -4px 0 rgba(0, 66, 143, 0.45),
    0 2px 0 rgba(1, 47, 105, 0.8);
  cursor: pointer;
  font-family: "SimHei", "Microsoft YaHei", sans-serif;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -webkit-text-fill-color: #ffffff;
  user-select: none;
}

.button-content {
  position: relative;
  z-index: 1;
  display: block;
  text-shadow:
    0 2px 0 #04366d,
    1px 0 0 #04366d,
    -1px 0 0 #04366d;
  white-space: nowrap;
}

.button:hover,
.button:focus-visible {
  background:
    linear-gradient(0deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.44) 44%, transparent 45%),
    linear-gradient(0deg, #8ecbff 0%, #4aa7ee 52%, #1377d2 100%);
  box-shadow:
    inset 0 0 0 2px #ffffff,
    inset 0 -3px 0 rgba(255, 255, 255, 0.36),
    inset 0 4px 0 rgba(0, 66, 143, 0.45),
    0 2px 0 rgba(1, 47, 105, 0.8);
  outline: 0;
}

.button:hover .button-content,
.button:focus-visible .button-content {
  transform: scale(1.04);
  transform-origin: center;
}

.button:active {
  transform: translateY(1px);
}
</style>
