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
    MessageCard
  },
  async asyncData ({ $axios }) {
    return $axios.get(
      `https://slack.com/api/conversations.history?token=${process.env.SLACK_API_TOKEN}&channel=${process.env.CHANNEL_ID}`
    ).then((res) => {
      const pageSize = 10;
      return { 
        messages: res.data.messages,
        page: 1,
        pageSize: pageSize,
        displayMessages: res.data.messages.slice(0, pageSize),
        pageLength: res.data.messages.length / pageSize,
        threadShow: false,
        threadMessages: [],
      }
    })
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
    }
  }
}
</script>
