/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log.info("Yay, the app was loaded!");

  app.webhooks.onAny(async (context) => {
    app.log.info(context);
  });

  app.onAny(async (context) => {
    context.log.info(context);
  });

  app.on("check_run", async (context) => {
    context.log.info(context);
  });

  app.on("check_run.completed", async (context) => {
    context.log.info(context);
  });

  app.on("check_run.created", async (context) => {
    context.log.info(context);
  });
};
