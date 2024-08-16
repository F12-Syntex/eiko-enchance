<template>
  <div class="terminal" @click="focusInput">
    <div class="header">
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    <div class="content">
      <pre v-html="output"></pre>
      <div class="input-line">
        <span>&gt; </span>
        <input v-model="currentInput" @keyup.enter="processCommand" class="input" ref="inputField" autofocus />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const output = ref('Welcome to the Terminal!\n');
const currentInput = ref('');
const inputField = ref(null);
const router = useRouter();

const commands = {
  help: { description: 'Show this help message', action: showHelp },
  clear: { description: 'Clear the terminal', action: clearTerminal },
  magik_editor: { description: 'Open the Magik Editor', action: openMagikEditor },
};

function processCommand() {
  const command = currentInput.value.trim();
  if (command) {
    appendOutput(`> ${command}\n`);
    if (commands[command]) {
      commands[command].action();
    } else {
      appendOutput(`Command not found: ${command}\n`, 'red');
    }
    currentInput.value = '';
  }
}

function showHelp() {
  appendOutput('Available commands:\n');
  Object.entries(commands).forEach(([cmd, { description }]) => {
    appendOutput(`${cmd} - ${description}\n`, 'gray');
  });
}

function clearTerminal() {
  output.value = '';
}

function openMagikEditor() {
  appendOutput('Opening the Magik Editor...\n', 'green');
  router.push('/ai-models');
}

function appendOutput(text, color = 'white') {
  output.value += `<span style="color: ${color}">${text}</span>`;
}

function focusInput() {
  inputField.value.focus();
}

onMounted(() => {
  focusInput();
});
</script>

<style scoped>
.terminal {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60vh;
  background-color: #000;
  color: #00ff00;
  padding: 20px;
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  font-family: monospace;
  cursor: text;
}

.header {
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background-color: transparent;
  color: #00ff00;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
}

.close-btn:hover {
  color: #aaa;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  white-space: pre-wrap;
  font-size: 1em;
}

.input-line {
  display: flex;
  align-items: center;
}

.input {
  flex: 1;
  background: transparent;
  border: none;
  color: #00ff00;
  outline: none;
  font-family: monospace;
  font-size: 1em;
}
</style>