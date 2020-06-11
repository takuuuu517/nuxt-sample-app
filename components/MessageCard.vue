<template>
  <v-card class="messageCard">
    <v-list-item three-line>
      <v-list-item-content>
        {{ message.text }}
      </v-list-item-content>
    </v-list-item>

    <v-card-actions v-if="!isThread">
      <v-btn v-if="message.reply_count" text @click="showThread">
        {{ message.reply_count }}件の返信
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: ["message", "isThread"],
  methods: {
    showThread() {
      this.$emit("show-thread", this.message.ts)
    },
  },
}
</script>
