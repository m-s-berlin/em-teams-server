const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
const Joi = require("joi");
require("express-async-errors");

// Model

const Team = mongoose.model(
  "Team",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
  })
);

// Validation

function validateTeam(team) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
  });

  return schema.validate(team);
}

// Routes

app.use(express.json());

router.get("/", async (req, res) => {
  const teams = await Team.find().sort("name");

  res.send(teams);
});

router.post("/", async (req, res) => {
  const { error } = validateTeam(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const team = new Team({
    name: req.body.name,
  });
  await team.save();

  res.send(team);
});

router.put("/:id", async (req, res) => {
  const { error } = validateTeam(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const team = await Team.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    { new: true }
  );

  if (!team)
    return res.status(404).send("The team with the given ID was not found.");

  res.send(team);
});

router.delete("/:id", async (req, res, next) => {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team)
      return res.status(404).send("The team with the given ID was not found.");

    res.send(team);
});

app.use("/teams", router);

app.use((err, req, res, next) => {
  res.status(err.code || 500).send({ error: err.message });
});

// Launch

mongoose
  .connect("mongodb://localhost/em-teams")
  .then(() => console.log(`Connected to DB`));

app.listen(3000, () => console.log("Listening on port http://localhost:3000"));
