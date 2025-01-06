<template>
    <div 
      :class="[
        'z-50',
        modelValue ? 'h-full w-full' : 'fixed bottom-4 right-4'
      ]"
    >
      <!-- Chat Toggle Button -->
      <Transition
        enter-active-class="transition-transform duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <button
          v-if="!modelValue && !isOpen"
          @click="toggleChat"
          class="p-4 rounded-full shadow-lg transition-all duration-200 bg-blue-500 hover:bg-blue-600"
        >
          <MessageSquare class="h-6 w-6 text-white" />
        </button>
      </Transition>
  
      <!-- Chat Window -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div 
          v-show="isOpen || modelValue"
          :class="[
            'bg-white flex flex-col transition-all duration-300',
            modelValue 
              ? 'h-full w-full' 
              : 'absolute bottom-16 right-0 w-96 h-[500px] rounded-lg shadow-xl'
          ]"
        >
          <!-- Header -->
          <div 
            :class="[
              'p-4 bg-blue-500 text-white flex justify-between items-center',
              !modelValue && 'rounded-t-lg'
            ]"
          >
            <div class="flex items-center gap-3">
              <h3 class="font-semibold">Stock Analysis Assistant</h3>
              <div 
                v-if="tableId" 
                class="flex items-center px-2 py-1 rounded-full bg-blue-400/30 border border-blue-400/50"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5"></span>
                <span class="text-xs font-medium text-white/90">Active Session</span>
              </div>
            </div>
  
            <div class="flex items-center gap-1">
              <button 
                @click="startNewChat"
                class="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors flex items-center gap-1 text-sm"
                :disabled="isTyping"
              >
                <PlusCircle class="h-4 w-4" />
                <span class="hidden sm:inline">New Chat</span>
              </button>
              <button 
                @click="handleMaximize"
                class="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors"
                :title="modelValue ? 'Minimize' : 'Maximize'"
              >
                <Maximize2 v-if="!modelValue" class="h-4 w-4" />
                <Minimize2 v-else class="h-4 w-4" />
              </button>
              <button 
                v-if="!modelValue"
                @click="toggleChat"
                class="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors"
                title="Close"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>
  
          <!-- Messages Area -->
          <div 
            class="flex-1 overflow-y-auto p-4 space-y-4" 
            ref="messagesContainer"
          >
            <TransitionGroup
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="transform -translate-y-4 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="transform translate-y-0 opacity-100"
              leave-to-class="transform -translate-y-4 opacity-0"
            >
              <div
                v-for="(msg, idx) in messages"
                :key="idx"
                :class="['flex', msg.role === 'assistant' ? 'justify-start' : 'justify-end']"
              >
                <div
                  :class="[
                    'max-w-[90%] p-3 rounded-lg relative group',
                    msg.role === 'assistant' ? 'bg-gray-100 text-gray-800' : 'bg-blue-500 text-white'
                  ]"
                >
                  <button
                    v-if="msg.role === 'assistant'"
                    @click="copyToClipboard(msg.content)"
                    class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy message"
                  >
                    <Copy class="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </button>
                  
                  <div 
                    v-if="msg.role === 'assistant'"
                    class="prose prose-sm max-w-none dark:prose-invert pr-6"
                    v-html="renderMarkdown(msg.content)"
                  />
                  <div v-else>
                    {{ msg.content }}
                  </div>
                </div>
              </div>
            </TransitionGroup>
            
            <!-- Typing Indicator -->
            <div v-if="isTyping" class="flex justify-start">
              <div class="bg-gray-100 text-gray-800 p-3 rounded-lg flex items-center space-x-2">
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms" />
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms" />
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms" />
              </div>
            </div>
          </div>
  
          <!-- Input Area -->
          <form @submit.prevent="sendMessage" class="p-4 border-t">
            <div class="flex gap-2">
              <input
                v-model="input"
                type="text"
                placeholder="Type your message..."
                class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                :disabled="isTyping"
              />
              <button
                type="submit"
                :disabled="isTyping || !input.trim()"
                class="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send class="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, nextTick } from 'vue'
  import { 
    MessageSquare, 
    X, 
    Send, 
    Copy, 
    Maximize2, 
    Minimize2,
    PlusCircle 
  } from 'lucide-vue-next'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  
  interface Message {
    content: string
    role: 'user' | 'assistant'
  }
  
  const props = defineProps<{
    modelValue: boolean
  }>()
  
  const emit = defineEmits(['update:modelValue'])
  
  const isOpen = ref(false)
  const input = ref('')
  const messages = ref<Message[]>([])
  const messagesContainer = ref<HTMLElement | null>(null)
  const isTyping = ref(false)
  const tableId = ref<string | null>(null)
  
  // Preserve chat state
  let preservedState = {
    messages: [] as Message[],
    tableId: null as string | null
  }
  
  const renderMarkdown = (content: string): string => {
    try {
      const parsed = marked.parse(content) as string
      return DOMPurify.sanitize(parsed, {
        ALLOWED_TAGS: ['p', 'code', 'pre', 'em', 'strong', 'ul', 'ol', 'li', 'blockquote']
      })
    } catch (error) {
      console.error('Error rendering markdown:', error)
      return content
    }
  }
  
  const handleMaximize = () => {
    if (props.modelValue) {
      // Save state before minimizing
      preservedState = {
        messages: [...messages.value],
        tableId: tableId.value
      }
    } else {
      // Restore state when maximizing
      if (preservedState.tableId) {
        messages.value = [...preservedState.messages]
        tableId.value = preservedState.tableId
      }
    }
    emit('update:modelValue', !props.modelValue)
    if (!props.modelValue) {
      isOpen.value = true
    }
  }
  
  const toggleChat = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value && messages.value.length === 0) {
      startNewChat()
    }
  }
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }
  
  const scrollToBottom = async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
  
  const startNewChat = async () => {
    try {
      isTyping.value = true
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBaseUrl}/chat/new`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to start new chat')
      }
      
      const data = await response.json()
      tableId.value = data.table_id
      
      messages.value = [{
        content: data.initial_message,
        role: 'assistant'
      }]
  
      // Update preserved state
      preservedState = {
        messages: [...messages.value],
        tableId: tableId.value
      }
      
      await scrollToBottom()
    } catch (error) {
      console.error('Error starting new chat:', error)
      messages.value = [{
        content: 'Error starting chat. Please try again.',
        role: 'assistant'
      }]
    } finally {
      isTyping.value = false
    }
  }
  
  const sendMessage = async () => {
    if (!input.value.trim() || isTyping.value || !tableId.value) return
    
    const userMessage = input.value
    input.value = ''
    isTyping.value = true
    
    try {
      messages.value.push({
        content: userMessage,
        role: 'user'
      })
      await scrollToBottom()
  
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBaseUrl}/chat/${tableId.value}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: userMessage,
        }),
      })
  
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
  
      const data = await response.json()
      
      messages.value.push({
        content: data.message,
        role: 'assistant'
      })
  
      // Update preserved state after successful message
      preservedState = {
        messages: [...messages.value],
        tableId: tableId.value
      }
    } catch (error) {
      console.error('Error sending message:', error)
      messages.value.push({
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant'
      })
    } finally {
      isTyping.value = false
      await scrollToBottom()
    }
  }
  
  // Watch for changes to restore state
  watch(() => props.modelValue, (newValue) => {
    if (newValue && preservedState.tableId) {
      messages.value = [...preservedState.messages]
      tableId.value = preservedState.tableId
    }
  })
  </script>
  
  <style scoped>
  .transform {
    transform-origin: bottom right;
  }
  
  /* Improved typing animation */
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  
  .animate-bounce {
    animation: bounce 1s infinite;
  }
  
  /* Improved scrollbar styling */
  .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  
  /* Button hover effects */
  button:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease;
  }
  
  /* Ensure smooth transitions */
  .transition-all {
    transition-property: all;
  }
  
  .duration-200 {
    transition-duration: 200ms;
  }
  
  .duration-300 {
    transition-duration: 300ms;
  }
  
  .ease-in-out {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  </style>