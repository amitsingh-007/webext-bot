/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log.info("Yay, the app was loaded!");

  app.on("check_run.completed", async (context) => {
    app.log.info(context);
  });
};
