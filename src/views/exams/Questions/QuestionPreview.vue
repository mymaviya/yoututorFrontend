<template>
   <div v-html="question.question" />

    <v-img
    v-if="question.question_image"
    :src="question.question_image"
    /> 

</template>