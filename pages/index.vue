<template>
  <v-layout>
    <v-flex>
      <br />
      <h2>メッセージ一覧</h2>
      <message-card
        v-for="message in this.$store.state.messages.displayMessages"
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
        v-for="message in this.getThreadMessages"
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

const pageSize = 10;

export default {
  components: {
    MessageCard,
    MessageForm,
  },
  data () {
    return {
      page: 1,
      pageSize: 10,
      threadShow: false,
      messageForPost: "",
      threadTs: null
    }
  },
  async fetch({ store, $axios }){
    let res = await $axios.get(
      `https://slack.com/api/conversations.history?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}`
    )
    this.messages = res.data.messages;
    store.commit("messages/SET_MESSAGES", res.data.messages);
    store.commit("messages/SET_DISPLAY_MESSAGES", res.data.messages.slice(0, pageSize));
    store.commit("messages/SET_PAGE_LENGTH", res.data.messages.length / pageSize);
  },
  computed: {
    getThreadMessages() {
      return this.$store.state.messages.threadMessages;
    },
    getPageLength() {
      return parseInt(this.$store.state.messages.pageLength)
    },
    getDisplayMessages() {
      return this.displayMessages;
    }
  },
  methods: {
    selectPage(selectedPage) {
      this.page = selectedPage
      this.$store.commit("messages/SET_DISPLAY_MESSAGES", this.$store.state.messages.messages.slice(
        (this.page - 1) * 10,
        pageSize * this.page
      ));
      this.closeThread()
      window.scrollTo(0, 0)
    },
    showThread(ts) {
      this.$axios
        .get(
          `https://slack.com/api/conversations.replies?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}&ts=${ts}`
        )
        .then((res) => {
          this.$store.commit("messages/SET_THREAD_MESSAGES", res.data.messages);
          this.threadShow = true
          this.threadTs = ts
        })
    },
    closeThread() {
      this.$store.commit("messages/SET_THREAD_MESSAGES", [])
      this.threadTs = null
      this.threadShow = false
    },
    async refreshMessages() {
      this.$axios
        .get(
          `https://slack.com/api/conversations.history?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}`
        )
        .then((res) => {
          this.$store.commit("messages/SET_MESSAGES", res.data.messages)
          this.$store.commit("messages/SET_DISPLAY_MESSAGES", res.data.messages.slice(
            (this.page - 1) * 10,
            pageSize * this.page
          ));
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
