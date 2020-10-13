<template>
  <v-card class="messageCard">
    <v-list-item three-line>
      <v-list-item-content>
        <div v-html="messageWithHTMLTag"/>
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

  computed: {
    messageWithHTMLTag() {
      const httpMatchRegex = /<http.+?\>/g;
      const imgRegex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
      let words = this.message.text.split(/(<.+?>)/)
      let new_words = []
      let images = []

      words.forEach((word) => {
        if((httpMatchRegex).test(word)) {
          const [actualLink, displayLink] = word.match(/(?<=\<).*?(?=\>)/)[0].split('|')
          if(imgRegex.test(actualLink)){
            images.push(`<img src=${actualLink} width="200"> `);
            new_words.push('');
          } else { // link
            new_words.push(this.replaceLinkWithATag(actualLink, displayLink));
          }
        } else {
          new_words.push(word.replace(/</g,'&lt;').replace(/>/g,'&gt;'));
        }
      });

      let new_message = new_words.join('');
      if(images.length > 0) {
        new_message += "<br>"
        images.forEach((imgTag) => {
          new_message += imgTag;
        });
        return new_message;
      }
      return new_words.join('')
    }
  },

  methods: {
    showThread() {
      this.$emit('showThread', this.message.ts);
    },
    replaceLinkWithATag(actualLink, displayLink){
      return `<a href="${actualLink}" target="_blank">${displayLink || actualLink}</a>`
    },
  },
}
</script>
