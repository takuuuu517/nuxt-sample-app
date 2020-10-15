<template>
  <v-layout>
    <v-flex>
      <message-card
        v-for="message in displayMessages"
        v-bind:message="message"
        v-bind:users="users"
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
        v-bind:users="users"
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
    async function usersList(){
      let usersList;
      let usersRes = await $axios.get(
        `https://slack.com/api/users.list?token=${process.env.SLACK_API_TOKEN}`
      );
      usersList = usersRes.data.members;

      while(true) {
        let cursor = usersRes.data.response_metadata.next_cursor
        if(cursor == "") {
          break;
        }
        usersRes = await $axios.get(
          `https://slack.com/api/users.list?token=${process.env.SLACK_API_TOKEN}&cursor=${cursor}`
        );
        usersList = usersList.concat(usersRes.data.members);
      }

      return await usersList;
    }

    const messagesRes = await $axios.get(
      `https://slack.com/api/conversations.history?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}`
    );

    let users = await usersList();

    const pageSize = 10;
    return {
      messages: messagesRes.data.messages,
      page: 1,
      pageSize: pageSize,
      displayMessages: messagesRes.data.messages.slice(0, pageSize),
      pageLength: Math.ceil(messagesRes.data.messages.length / pageSize),
      threadShow: false,
      threadMessages: [],
      users: users,
    }
  },

  data: () => ({
    users: [],
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
