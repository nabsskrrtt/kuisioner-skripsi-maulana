<template>
  <div class="signature-container">
    <label class="form-label">{{ label }} <span class="required">*</span></label>
    <div class="canvas-wrapper" ref="wrapper">
      <canvas 
        ref="canvas" 
        @mousedown="startDrawing" 
        @mousemove="draw" 
        @mouseup="stopDrawing" 
        @mouseleave="stopDrawing"
        @touchstart="startDrawingTouch" 
        @touchmove="drawTouch" 
        @touchend="stopDrawing"
      ></canvas>
    </div>
    <div class="signature-actions">
      <div class="actions-left">
        <button type="button" class="btn-clear" @click="clear">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
          </svg>
          Bersihkan
        </button>
        <button type="button" class="btn-upload" @click="triggerFileInput">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
          </svg>
          Unggah File TTD
        </button>
        <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="onFileSelected" />
      </div>
      <span v-if="isEmpty" class="sign-hint">Gunakan mouse/sentuhan atau unggah file</span>
      <span v-else class="sign-ok">✓ Tanda tangan terekam</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Tanda Tangan'
  }
});

const emit = defineEmits(['update:modelValue']);

const canvas = ref(null);
const wrapper = ref(null);
const isDrawing = ref(false);
const isEmpty = ref(true);
let ctx = null;

const resizeCanvas = () => {
  if (!canvas.value || !wrapper.value) return;
  
  // Store the current signature if any
  const tempSig = canvas.value.toDataURL();
  
  const rect = wrapper.value.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  canvas.value.width = rect.width * dpr;
  canvas.value.height = 160 * dpr; // Static height for signature pad
  canvas.value.style.width = `${rect.width}px`;
  canvas.value.style.height = `160px`;
  
  ctx = canvas.value.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Restore drawing if it wasn't empty
  if (!isEmpty.value) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, rect.width, 160);
    };
    img.src = tempSig;
  } else {
    clear();
  }
};

onMounted(() => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // If modelValue is loaded from parent, mark as not empty
  if (props.modelValue) {
    isEmpty.value = false;
    const img = new Image();
    img.onload = () => {
      if (ctx) ctx.drawImage(img, 0, 0, canvas.value.width / (window.devicePixelRatio || 1), 160);
    };
    img.src = props.modelValue;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
});

// Watch modelValue changes (e.g., cleared by parent)
watch(() => props.modelValue, (newVal) => {
  if (!newVal && !isEmpty.value) {
    clearInternal();
  }
});

// Coordinates translation
const getMousePos = (e) => {
  const rect = canvas.value.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

const getTouchPos = (e) => {
  const rect = canvas.value.getBoundingClientRect();
  const touch = e.touches[0];
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
};

// Drawing handlers
const startDrawing = (e) => {
  isDrawing.value = true;
  ctx.beginPath();
  const pos = getMousePos(e);
  ctx.moveTo(pos.x, pos.y);
};

const draw = (e) => {
  if (!isDrawing.value) return;
  const pos = getMousePos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  isEmpty.value = false;
  emit('update:modelValue', canvas.value.toDataURL('image/png'));
};

const startDrawingTouch = (e) => {
  // Prevent scrolling on mobile
  if (e.cancelable) e.preventDefault();
  isDrawing.value = true;
  ctx.beginPath();
  const pos = getTouchPos(e);
  ctx.moveTo(pos.x, pos.y);
};

const drawTouch = (e) => {
  if (!isDrawing.value) return;
  if (e.cancelable) e.preventDefault();
  const pos = getTouchPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  isEmpty.value = false;
  emit('update:modelValue', canvas.value.toDataURL('image/png'));
};

const stopDrawing = () => {
  isDrawing.value = false;
};

const clearInternal = () => {
  if (!canvas.value || !ctx) return;
  const rect = canvas.value.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, 160);
  isEmpty.value = true;
};

const clear = () => {
  clearInternal();
  emit('update:modelValue', '');
};

const fileInput = ref(null);

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
};

const onFileSelected = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target.result;
    const img = new Image();
    img.onload = () => {
      clearInternal();
      if (ctx && canvas.value) {
        const rect = wrapper.value.getBoundingClientRect();
        const canvasWidth = rect.width;
        const canvasHeight = 160;
        
        const imgRatio = img.width / img.height;
        const canvasRatio = canvasWidth / canvasHeight;
        
        let drawWidth = canvasWidth;
        let drawHeight = canvasHeight;
        let xOffset = 0;
        let yOffset = 0;
        
        if (imgRatio > canvasRatio) {
          drawWidth = canvasWidth;
          drawHeight = canvasWidth / imgRatio;
          yOffset = (canvasHeight - drawHeight) / 2;
        } else {
          drawHeight = canvasHeight;
          drawWidth = canvasHeight * imgRatio;
          xOffset = (canvasWidth - drawWidth) / 2;
        }
        
        ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight);
        isEmpty.value = false;
        emit('update:modelValue', dataUrl);
      }
    };
    img.src = dataUrl;
    if (fileInput.value) fileInput.value.value = '';
  };
  reader.readAsDataURL(file);
};
</script>

<style scoped>
.signature-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.canvas-wrapper {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background-color: #fafbfc;
  cursor: crosshair;
  overflow: hidden;
  height: 162px;
  touch-action: none; /* Prevents browser scroll on touch */
}

canvas {
  display: block;
  width: 100%;
  height: 160px;
}

.signature-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.btn-clear {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear:hover {
  background-color: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

.actions-left {
  display: flex;
  gap: 8px;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-upload:hover {
  background-color: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

.sign-hint {
  font-size: 0.8rem;
  color: #94a3b8;
  text-align: right;
}

.sign-ok {
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 600;
  text-align: right;
}

.required {
  color: #ef4444;
}
</style>
