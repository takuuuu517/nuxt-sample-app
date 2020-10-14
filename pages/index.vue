<template>
  <v-layout>
    <v-flex>
      <message-card
        v-for="message in displayMessages"
        v-bind:message="message"
        v-bind:isThread=false
        v-bind:key="message.ts"
        @showThread="showThread($event)"
      />
      <v-form ref="form">
        <v-textarea
          v-model="sendingMessage"
          :counter="max"
          :rules="rules"
          label="投稿メッセージ"
          placeholder="投稿文書、URL"
        />
        <v-btn @click="submit">submit</v-btn>
      </v-form>
      <v-pagination
        v-model="page"
        :length="pageLength"
        @input = "selectPage"
      />
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
      />
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
    async function replaceMessages(displayMessages) {
      let abc = displayMessages;
      // console.log(abc);
      const userMentionRegex = /<@[A-Z0-9]+?>/gm;
      displayMessages.forEach(async(message, i ) => {
        let sendingUser = await getUserName(message.user);

        let userIds = message.text.match(userMentionRegex);
        if(userIds){
          userIds.forEach( async (userId) => {
            let userName = await getUserName(userId.substring(2, userId.length-1))
            // console.log(userName);
            message.text = "<" + sendingUser + ">" + message.text.replace(userId, '@'+userName)
            abc[i].text = message.text;
            console.log(abc[i].text);
          });
        }
      });
      console.log(abc[0].text);
      // await sleep(5000);
    }

    function getUserName(userId){
      return $axios.get(
        `https://slack.com/api/users.info?token=${process.env.SLACK_API_TOKEN}&user=${userId}`)
        .then(response => {
          // console.log(response);
          if(response.data.ok == false) {
            alert(response.data.error)
            return;
          }
          // console.log(response.data.user.profile.display_name);
          return response.data.user.profile.display_name;
        })
        .catch(error => alert(error));
    }

    const res = await $axios.get(
      `https://slack.com/api/conversations.history?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}`
    )
    const pageSize = 10;
    let temp = {
      messages: res.data.messages,
      page: 1,
      pageSize: pageSize,
      displayMessages: res.data.messages.slice(0, pageSize),
      pageLength: Math.ceil(res.data.messages.length / pageSize),
      threadShow: false,
      threadMessages: [],
    }
    // return temp;

    temp.displayMessages = await replaceMessages(temp.displayMessages);
    // console.log(temp.displayMessages);

    return temp;

    return await $axios.get(
      `https://slack.com/api/conversations.history?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}`
    ).then((res) => {

      return {
        messages: res.data.messages,
        page: 1,
        pageSize: pageSize,
        displayMessages: res.data.messages.slice(0, pageSize),
        pageLength: Math.ceil(res.data.messages.length / pageSize),
        threadShow: false,
        threadMessages: [],
      }
    }).then((info) => {
      replaceMessages(info.displayMessages);
      return info;
    })
  },

  data: () => ({
    max: 4000,
    sendingMessage: "",
    displayMessages: [],
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
      if(!this.$refs.form.validate()){
        alert("文字数オーバーです。");
        return;
      }
      this.$axios.post(
        `https://slack.com/api/chat.postMessage?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}&text=${this.sendingMessage}`)
        .then(response => {
          if(response.data.ok == false) {
            alert(response.data.error)
          }else {
            alert("投稿できました。");
            this.sendingMessage = ""
          }
        })
        .catch(error => alert(error));
    }
  }
}
</script>
