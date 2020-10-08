<template>
  <v-layout>
    <v-flex>
      <message-card
        v-for="message in displayMessages"
        v-bind:message="message"
        v-bind:isThread=false
        v-bind:key="message.ts"
        @showThread="showThread($event)"
      ></message-card>

      <v-form ref="form">
        <v-textarea
          v-model="sendingMessage"
          :counter="max"
          :rules="rules"
          label="投稿メッセージ"
          placeholder="投稿文書、リンク、画像url"
        ></v-textarea>
        <v-btn @click="submit">submit</v-btn>
      </v-form>

      <v-pagination
        v-model="page"
        :length="pageLength"
        @input = "selectPage"
      ></v-pagination>
    </v-flex>
    <v-flex class="thread-column" v-show="threadShow">
      <h3 class="center">スレッド</h3>
      <div class="right">
        <v-btn class="mx-2 right" fab dark small color="pink" v-on:click="closeThread">
          <v-icon dark>mdi-minus</v-icon>
        </v-btn>
      </div>
      <br>
      <message-card
        v-for="message in threadMessages"
        v-bind:message="message"
        v-bind:isThread=true
        v-bind:key="message.ts"
      ></message-card>
    </v-flex>
  </v-layout>
</template>

<script>
import MessageCard from '~/components/MessageCard.vue'

export default {
  components: {
    MessageCard,
  },

  async asyncData ({ $axios }) {
    return $axios.get(
      `https://slack.com/api/conversations.history?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}`
    ).then((res) => {
      console.log(res.data.messages[9]);
      const pageSize = 10;
      return {
        messages: res.data.messages,
        page: 1,
        pageSize: pageSize,
        displayMessages: res.data.messages.slice(0, pageSize),
        pageLength: Math.ceil(res.data.messages.length / pageSize),
        threadShow: false,
        threadMessages: [],
      }
    })
  },
  data: () => ({
    allowSpaces: false,
    max: 4000,
    sendingMessage: ""
  }),

  computed: {
    rules () {
      const rules = []

      if (this.max) {
        const rule =
        v => (v || '').length <= this.max || `文字数の制限は${this.max}文字です`
        rules.push(rule)
      }

      return rules
    }
  },

  methods: {
    selectPage(selectedPage) {
      this.page = selectedPage;
      this.displayMessages = this.messages.slice((this.page - 1) * 10, this.pageSize * this.page)
      this.closeThread();
      window.scrollTo(0,0)
    },
    showThread(ts) {
      this.$axios.get(
        `https://slack.com/api/conversations.replies?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}&ts=${ts}`
      ).then((res) => {
        this.threadMessages = res.data.messages;
        this.threadShow = true;
      })
    },
    closeThread() {
      this.threadMessages = [];
      this.threadShow = false;
    },
    submit() {
      this.$axios.post(
        `https://slack.com/api/chat.postMessage?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}&text=${this.sendingMessage}`)
        .then(response => alert("投稿されました"))
        .catch(error => console.log(serror))
    }
  }
}

</script>
