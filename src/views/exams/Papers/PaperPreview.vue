<template>
    <div class="paper-preview">
    
        <h2>{{ paper.name }}</h2>
    
        <div v-for="(question, index) in paper.questions" :key="index" class="question-preview">
        <p><strong>Question {{ index + 1 }}:</strong> {{ question.text }}</p>
        <ul>
            <li v-for="(option, idx) in question.options" :key="idx">
            {{ option }}
            </li>
        </ul>
        </div>
    
    </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
    setup() {
        const paper = {
            name: 'Sample Paper',
            questions: [
                {
                    text: 'What is the capital of France?',
                    options: ['Paris', 'London', 'Berlin', 'Madrid']
                },
                {
                    text: 'What is 2 + 2?',
                    options: ['3', '4', '5', '6']
                }
            ]
        }

        return {
            paper
        }
    },
})
</script>
