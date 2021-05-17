const sleep = (time) => {
  return new Promise((resolve, _reject) => {
    setTimeout(resolve, time);
  });
};

export default sleep;
