<template>
  <v-card class="messageCard">
    <v-list-item three-line>
      <v-list-item-content>
        {{ stringToATag(message.text) }}
      </v-list-item-content>
    </v-list-item>

    <v-card-actions v-if="!isThread">
      <v-btn text v-if="message.reply_count" v-on:click="showThread">{{message.reply_count}}件の返信</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: ["message", "isThread"],
  methods: {
    showThread() {
      this.$emit('showThread', this.message.ts);
    },
    stringToATag(text) {
      var arr = text.match(/\<.+?\..+?\>/);

      if(!arr) {
        return text;
      } else {
        var matchedLinks = text.match(/\<.+?\..+?\>/);

        matchedLinks.forEach((matchedLink) => {
          var links = matchedLink.substring(1, matchedLink.length -1 ).split('|');
          var actualLink = links[0];
          var displayLink = links[1];

          var htmlTagLink = actualLink.link(actualLink);
          if(displayLink){
            htmlTagLink = displayLink.link(actualLink);
          }
          // text = text.replace(matchedLink, htmlTagLink);
          text = text.replace(matchedLink, actualLink);
        });
        return text;
      }
    }
  },
}
</script>
