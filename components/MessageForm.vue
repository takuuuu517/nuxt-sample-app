<template>
  <div>
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
  </div>
</template>

<script>
export default {
  props: ["threadTs"],
  data() {
    return {
      messageForPost: "",
    }
  },
  methods: {
    convertParamObjIntoQueryString(params) {
      const ret = []
      for (const param in params)
        ret.push(
          encodeURIComponent(param) + "=" + encodeURIComponent(params[param])
        )
      return ret.join("&")
    },
    postMessage() {
      const params = {
        token: process.env.SLACK_API_TOKEN,
        channel: process.env.CHANNEL_ID,
        text: this.messageForPost,
      }
      if (this.threadTs !== undefined) {
        params.thread_ts = this.threadTs
      }

      this.$axios.post(
        `https://slack.com/api/chat.postMessage?${this.convertParamObjIntoQueryString(
          params
        )}`
      ).then((res) => {
        this.messageForPost = ""
        this.$emit("message-posted")
      })
    },
  },
}
</script>
