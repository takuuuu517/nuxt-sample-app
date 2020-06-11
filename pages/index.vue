<template>
  <v-layout>
    <v-flex>
      <br />
      <h2>メッセージ一覧</h2>
      <message-card
        v-for="message in displayMessages"
        :key="message.ts"
        :message="message"
        :is-thread="false"
        @show-thread="showThread($event)"
      />

      <br />
      <h2>メッセージを投稿する</h2>
      <message-form @message-posted="refreshMessages" />

      <v-pagination v-model="page" :length="getPageLength" @input="selectPage" />
    </v-flex>
    <v-flex v-show="threadShow" class="thread-column">
      <h3 class="center">
        スレッド
      </h3>
      <div class="right">
        <v-btn
          class="mx-2 right"
          fab
          dark
          small
          color="pink"
          @click="closeThread"
        >
          <v-icon dark>
            mdi-minus
          </v-icon>
        </v-btn>
      </div>
      <br />
      <message-card
        v-for="message in threadMessages"
        :key="message.ts"
        :message="message"
        :is-thread="true"
      />

      <br />
      <h3>返信する</h3>
      <message-form :threadTs="threadTs" @message-posted="refreshMessages" />
    </v-flex>
  </v-layout>
</template>

<script>
import MessageCard from "~/components/MessageCard.vue"
import MessageForm from "~/components/MessageForm.vue"

export default {
  components: {
    MessageCard,
    MessageForm,
  },
  computed: {
    getPageLength() {
      return parseInt(this.pageLength)
    }
  },
  async asyncData({ $axios }) {
    return await $axios
      .get(
        `https://slack.com/api/conversations.history?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}`
      )
      .then((res) => {
        const pageSize = 10
        return {
          messages: res.data.messages,
          page: 1,
          pageSize,
          displayMessages: res.data.messages.slice(0, pageSize),
          pageLength: res.data.messages.length / pageSize,
          threadShow: false,
          threadMessages: [],
          messageForPost: "",
          threadTs: null,
        }
      })
  },
  methods: {
    selectPage(selectedPage) {
      this.page = selectedPage
      this.displayMessages = this.messages.slice(
        (this.page - 1) * 10,
        this.pageSize * this.page
      )
      this.closeThread()
      window.scrollTo(0, 0)
    },
    showThread(ts) {
      this.$axios
        .get(
          `https://slack.com/api/conversations.replies?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}&ts=${ts}`
        )
        .then((res) => {
          this.threadMessages = res.data.messages
          this.threadShow = true
          this.threadTs = ts
        })
    },
    closeThread() {
      this.threadMessages = []
      this.threadTs = null
      this.threadShow = false
    },
    async refreshMessages() {
      this.$axios
        .get(
          `https://slack.com/api/conversations.history?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}`
        )
        .then((res) => {
          this.messages = res.data.messages
          this.displayMessages = this.messages.slice(
            (this.page - 1) * 10,
            this.pageSize * this.page
          )
          if (this.threadShow === true) {
            this.showThread(this.threadTs)
          } else {
            window.scrollTo(0, 0)
          }
        })
    },
  },
}
</script>
