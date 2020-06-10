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
        @showThread="showThread($event)"
      />

      <br />
      <h2>メッセージを投稿する</h2>
      <form>
        <v-textarea
          v-model="messageForPost"
          outlined
          label="メッセージを入力してください"
        />
      </form>

      <div>
        <v-btn large color="primary" @click="postMessage">
          SEND
        </v-btn>
      </div>

      <v-pagination v-model="page" :length="pageLength" @input="selectPage" />
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
      <form>
        <v-textarea
          v-model="messageForPost"
          outlined
          label="メッセージを入力してください"
        />
      </form>

      <div>
        <v-btn large color="primary" @click="postMessage">
          SEND
        </v-btn>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import MessageCard from "~/components/MessageCard.vue"

export default {
  components: {
    MessageCard,
  },
  async asyncData({ $axios }) {
    return $axios
      .get(
        `https://slack.com/api/conversations.history?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}`
      )
      .then((res) => {
        const pageSize = 10
        return {
          messages: res.data.messages,
          page: 1,
          pageSize: pageSize,
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
    convertParamObjIntoQueryString(params) {
      const ret = []
      for (let param in params)
        ret.push(
          encodeURIComponent(param) + "=" + encodeURIComponent(params[param])
        )
      return ret.join("&")
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

    postMessage() {
      let params = {
        token: process.env.SLACK_API_TOKEN,
        channel: process.env.CHANNEL_ID,
        text: this.messageForPost,
      }
      if (this.threadTs !== null) {
        params["thread_ts"] = this.threadTs
      }

      this.$axios.post(
        `https://slack.com/api/chat.postMessage?${this.convertParamObjIntoQueryString(
          params
        )}`
      )
      this.messageForPost = ""
    },
  },
}
</script>
