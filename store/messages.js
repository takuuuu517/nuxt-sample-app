export const state = () => ({
  messages: [],
  displayMessages: [],
  threadMessages: [],
  pageLength: 0,
});

export const mutations = {
  SET_MESSAGES(state, payload) {
    state.messages = payload;
  },
  SET_DISPLAY_MESSAGES(state, payload) {
    state.displayMessages = payload;
  },
  SET_THREAD_MESSAGES(state, payload) {
    state.threadMessages = payload;
  },
  SET_PAGE_LENGTH(state, payload) {
    state.pageLength = payload;
  }
};
