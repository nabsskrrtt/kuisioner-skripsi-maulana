<template>
  <div class="spine-container">
    <label class="form-label">
      Area Nyeri Punggung (Anatomi Vertebra) <span class="required">*</span>
    </label>
    <p class="spine-sub">
      Pilih bagian punggung yang terasa nyeri (bisa klik gambar anatomi atau kotak pilihan):
    </p>

    <div class="spine-layout">
      <!-- Interactive SVG Diagram -->
      <div class="spine-diagram-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 320" class="spine-svg">
          <!-- Body Silhouette Backdrop -->
          <path 
            d="M 80,10 C 105,10 115,25 115,40 C 115,58 95,65 95,75 C 95,95 130,100 135,120 C 140,140 135,220 135,250 C 130,270 120,290 120,310 L 40,310 C 40,290 30,270 25,250 C 25,220 20,140 25,120 C 30,100 65,95 65,75 C 65,65 45,58 45,40 C 45,25 55,10 80,10 Z" 
            fill="#eef2f6" 
            stroke="#cbd5e1" 
            stroke-width="1.5"
          />

          <!-- Cervical (Leher) Section -->
          <g 
            class="spine-section" 
            :class="{ active: modelValue.leher }"
            @click="toggleSection('leher')"
          >
            <!-- Highlight area -->
            <path d="M 60,45 Q 80,48 100,45 L 98,75 Q 80,78 62,75 Z" class="section-overlay" />
            <!-- Vertebrae representation -->
            <rect x="72" y="47" width="16" height="5" rx="1.5" class="vertebra" />
            <rect x="71" y="54" width="18" height="5" rx="1.5" class="vertebra" />
            <rect x="70" y="61" width="20" height="5" rx="1.5" class="vertebra" />
            <rect x="71" y="68" width="18" height="5" rx="1.5" class="vertebra" />
            <!-- Label line -->
            <line x1="88" y1="58" x2="140" y2="58" class="label-line" />
            <circle cx="140" cy="58" r="3" class="label-dot" />
          </g>

          <!-- Thoracic (Punggung Dada) Section -->
          <g 
            class="spine-section" 
            :class="{ active: modelValue.dada }"
            @click="toggleSection('dada')"
          >
            <!-- Highlight area -->
            <path d="M 58,80 Q 80,83 102,80 L 108,180 Q 80,185 52,180 Z" class="section-overlay" />
            <!-- Vertebrae representation -->
            <rect x="69" y="81" width="22" height="6" rx="2" class="vertebra" />
            <rect x="68" y="90" width="24" height="6" rx="2" class="vertebra" />
            <rect x="67" y="99" width="26" height="6" rx="2" class="vertebra" />
            <rect x="67" y="108" width="26" height="6" rx="2" class="vertebra" />
            <rect x="66" y="117" width="28" height="6" rx="2" class="vertebra" />
            <rect x="65" y="126" width="30" height="6" rx="2" class="vertebra" />
            <rect x="65" y="135" width="30" height="6" rx="2" class="vertebra" />
            <rect x="66" y="144" width="28" height="6" rx="2" class="vertebra" />
            <rect x="67" y="153" width="26" height="6" rx="2" class="vertebra" />
            <rect x="68" y="162" width="24" height="6" rx="2" class="vertebra" />
            <rect x="69" y="171" width="22" height="6" rx="2" class="vertebra" />
            <!-- Label line -->
            <line x1="91" y1="126" x2="140" y2="126" class="label-line" />
            <circle cx="140" cy="126" r="3" class="label-dot" />
          </g>

          <!-- Lumbar (Pinggang / Lower Back) Section -->
          <g 
            class="spine-section" 
            :class="{ active: modelValue.pinggang }"
            @click="toggleSection('pinggang')"
          >
            <!-- Highlight area -->
            <path d="M 52,185 Q 80,190 108,185 L 112,260 Q 80,265 48,260 Z" class="section-overlay" />
            <!-- Vertebrae representation -->
            <rect x="68" y="186" width="24" height="8" rx="2.5" class="vertebra" />
            <rect x="66" y="198" width="28" height="8" rx="2.5" class="vertebra" />
            <rect x="64" y="210" width="32" height="8" rx="2.5" class="vertebra" />
            <rect x="65" y="222" width="30" height="8" rx="2.5" class="vertebra" />
            <rect x="66" y="234" width="28" height="8" rx="2.5" class="vertebra" />
            <!-- Sacrum/Coccyx -->
            <path d="M 70,246 L 90,246 L 85,263 L 75,263 Z" fill="#94a3b8" />
            <!-- Label line -->
            <line x1="94" y1="216" x2="140" y2="216" class="label-line" />
            <circle cx="140" cy="216" r="3" class="label-dot" />
          </g>

          <!-- Section Label Texts -->
          <text x="145" y="61" class="svg-text">Leher (Cervical)</text>
          <text x="145" y="129" class="svg-text">Punggung (Thoracal)</text>
          <text x="145" y="219" class="svg-text">Pinggang (Lumbal)</text>
        </svg>
      </div>

      <!-- Synchronized Text Checkboxes -->
      <div class="spine-checkboxes">
        <div 
          class="checkbox-card" 
          :class="{ selected: modelValue.leher }"
          @click="toggleSection('leher')"
        >
          <div class="checkbox-box">
            <span v-if="modelValue.leher">✓</span>
          </div>
          <div class="checkbox-label">
            <strong>Leher (Cervical)</strong>
            <span>Nyeri di punggung atas dan leher</span>
          </div>
        </div>

        <div 
          class="checkbox-card" 
          :class="{ selected: modelValue.dada }"
          @click="toggleSection('dada')"
        >
          <div class="checkbox-box">
            <span v-if="modelValue.dada">✓</span>
          </div>
          <div class="checkbox-label">
            <strong>Punggung Dada (Thoracal)</strong>
            <span>Nyeri di punggung tengah / area belikat</span>
          </div>
        </div>

        <div 
          class="checkbox-card" 
          :class="{ selected: modelValue.pinggang }"
          @click="toggleSection('pinggang')"
        >
          <div class="checkbox-box">
            <span v-if="modelValue.pinggang">✓</span>
          </div>
          <div class="checkbox-label">
            <strong>Pinggang (Lumbal / Lower Back)</strong>
            <span>Nyeri di punggung bawah di atas pantat</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      leher: false,
      dada: false,
      pinggang: false
    })
  }
});

const emit = defineEmits(['update:modelValue']);

const toggleSection = (section) => {
  const updatedValue = { ...props.modelValue };
  updatedValue[section] = !updatedValue[section];
  emit('update:modelValue', updatedValue);
};
</script>

<style scoped>
.spine-container {
  margin-bottom: 28px;
}

.spine-sub {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.spine-layout {
  display: flex;
  gap: 32px;
  align-items: center;
  justify-content: center;
}

.spine-diagram-wrapper {
  width: 190px;
  flex-shrink: 0;
}

.spine-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.spine-section {
  cursor: pointer;
}

.section-overlay {
  fill: transparent;
  stroke: transparent;
  stroke-width: 2;
  transition: all 0.3s ease;
}

.spine-section:hover .section-overlay {
  fill: rgba(88, 166, 255, 0.15);
  stroke: var(--sky-blue);
  stroke-dasharray: 4;
}

.spine-section.active .section-overlay {
  fill: rgba(88, 166, 255, 0.3);
  stroke: var(--sky-blue);
  stroke-width: 2.5;
}

.vertebra {
  fill: #94a3b8;
  transition: all 0.3s ease;
}

.spine-section:hover .vertebra {
  fill: var(--sky-blue);
}

.spine-section.active .vertebra {
  fill: var(--sky-blue-hover);
}

.label-line {
  stroke: #94a3b8;
  stroke-width: 1.5;
  stroke-dasharray: 2;
  transition: all 0.3s ease;
}

.spine-section:hover .label-line,
.spine-section.active .label-line {
  stroke: var(--sky-blue-hover);
  stroke-dasharray: 0;
}

.label-dot {
  fill: #94a3b8;
  transition: all 0.3s ease;
}

.spine-section:hover .label-dot,
.spine-section.active .label-dot {
  fill: var(--sky-blue-hover);
  r: 4;
}

.svg-text {
  font-family: 'Outfit', sans-serif;
  font-size: 8px;
  font-weight: 600;
  fill: var(--text-dark);
}

.spine-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-grow: 1;
}

.checkbox-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  background-color: #fff;
  transition: var(--transition-smooth);
  user-select: none;
}

.checkbox-card:hover {
  border-color: var(--sky-blue);
  background-color: var(--sky-blue-light);
}

.checkbox-card.selected {
  border-color: var(--sky-blue);
  background-color: var(--sky-blue-light);
}

.checkbox-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid #cbd5e1;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: var(--sky-blue-hover);
  font-size: 0.95rem;
  transition: var(--transition-smooth);
}

.checkbox-card.selected .checkbox-box {
  border-color: var(--sky-blue);
  background-color: #fff;
}

.checkbox-label {
  display: flex;
  flex-direction: column;
}

.checkbox-label strong {
  font-size: 0.95rem;
  color: var(--text-dark);
}

.checkbox-label span {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.required {
  color: #ef4444;
}

@media (max-width: 600px) {
  .spine-layout {
    flex-direction: column;
    gap: 16px;
  }
  
  .spine-diagram-wrapper {
    width: 160px;
  }
}
</style>
