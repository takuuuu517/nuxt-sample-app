<template>
  <v-card class="messageCard">
    <v-list-item three-line>
      <v-list-item-content>
        <p v-html="messageWithHTMLTag(message.text)"></p>
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
    replaceLinkWithATag(actualLink, displayLink){
      let htmlTagLink = actualLink.link(actualLink);
      if(displayLink){
        htmlTagLink = displayLink.link(actualLink);
      }
      htmlTagLink = htmlTagLink.replace('a href=', 'a target="_blank" href=');
      return htmlTagLink
    },
    escape(text, links){
      let surroundedByAngleBracket =
        text.match(/<.+?\>/g).filter(n => !links.includes(n));
      surroundedByAngleBracket.forEach((elementInside) => {
        text = text.replace(elementInside, elementInside.replace(/</g,'&lt;').replace(/>/g,'&gt;'));
      });
      return text;
    },
    messageWithHTMLTag(text) {
      let matchedLinks = text.match(/<http.+?\>/g);
      let imageTags = [];

      if(!matchedLinks) {
        return text; // no link
      } else {
        text = this.escape(text, matchedLinks)

        matchedLinks.forEach((matchedLink) => {
          let links, actualLink, displayLink, htmlTagLink;
          links = matchedLink.substring(1, matchedLink.length - 1).split('|');
          actualLink = links[0];
          displayLink = links[1];

          if ((/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i).test(actualLink)) {
            imageTags.push(`<img src=${actualLink} width="200"> `);
            text = text.replace(matchedLink, actualLink.replace(actualLink, ''));
          } else {
            htmlTagLink = this.replaceLinkWithATag(actualLink, displayLink)
            text = text.replace(matchedLink, htmlTagLink);
          }
        });
        text += "<br>"
        imageTags.forEach((imgTag) => {
          text += imgTag;
        });

        return text;
      }
    }
  },
}
</script>
