const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const verifyRefreshToken = require("../functions/token/VerifyRefreshToken");
const signAccessToken = require("../functions/token/SignAccessToken");
const signRefreshToken = require("../functions/token/SignRefreshToken");
const addTaskToList = async (req, res) => {
  const { listId, name } = req.body;

  try {
    // Check if the list exists
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { tasks: true },
    });
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    // Create the task and associate it with the list
    const task = await prisma.task.create({
      data: {
        name,

        list: { connect: { id: listId } },
      },
    });
    const existingTasks = list.tasks.map((task) => ({ id: task.id }));
    const updatedTasks = [...existingTasks, { id: task.id }];
    console.log("updated array : ");
    console.log(updatedTasks);
    // Update the tasks array in the list
    const updatedList = await prisma.list.update({
      where: { id: listId },
      data: {
        tasks: {
          set: updatedTasks,
        },
      },
    });

    res.status(200).json({ message: "Task added to the list", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
const updateTaskInList = async (req, res) => {
  const { listId, taskId, name, completed } = req.body;

  try {
    // Check if the list exists
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    // Check if the task exists within the list
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.listId !== listId) {
      return res.status(404).json({ error: "Task not found in the list" });
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { name, completed },
    });

    res.status(200).json({ message: "Task updated", task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const addList = async (req, res) => {
  const { name } = req.body;
  const authorId = req.user.id;
  console.log("id is ", authorId);
  try {
    if (!name) {
      res.status(400).send("not name selected");
    }
    const list = await prisma.list.create({
      data: {
        name,
        author: { connect: { id: authorId } },
      },
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
const getList = async (req, res) => {
  const { listId } = req.body;
  try {
    if (!listId) {
      res.status(400).send("listId notFound");
    } else {
      const list = await prisma.list.findUnique({
        where: { id: listId },
        include: {
          tasks: {
            select: {
              id: true,
              name: true,
              completed: true,
              listId: true,
            },
          },
        },
      });
      res.json(list);
    }
  } catch (error) {
    res.status(500).send("server error");
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.hello;
    console.log(refreshToken);
    if (!refreshToken) {
      res.status(400).send("badRequest");
    }
    const userPayload = await verifyRefreshToken.verifyRefreshToken(
      refreshToken
    );

    const accessToken = await signAccessToken.signRefreshToken(userPayload.id);
    const refToken = await signRefreshToken.signRefreshToken(userPayload.id);
    res.send({ accessToken: accessToken, refreshToken: refToken });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addTaskToList,
  addList,
  getList,
  updateTaskInList,
  refreshToken,
};
