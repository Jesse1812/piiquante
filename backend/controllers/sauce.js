const Sauce = require('../models/Sauce');
const fs = require('fs');

const getImageUrl = (req) =>
  req.protocol + '://' + req.get('host') + '/images/' + req.file.filename;

// Création d'une sauce
exports.createSauce = async (req, res, next) => {
  // console.log(req.body.sauce);
  const input = JSON.parse(req.body.sauce);
  // console.log(input);
  const sauce = new Sauce({
    ...input,
    imageUrl: getImageUrl(req),
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch((error) => res.status(400).json({ error }));
};

// Autre façon de créer la sauce
// const input = JSON.parse(req.body.sauce);
// const imageUrl =
//   req.protocol + '://' + req.get('host') + '/images/' + req.file.filename;
// try {
//   await Sauce.create({ ...input });
//   res.status(201).json({ message: 'Sauce enregistrée !' });
// } catch (error) {
//   res.status(400).json({ error });
// }

// Affichage de la liste des sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Affichage d'une sauce selon son id
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

// Mise à jour d'une sauce selon son id
exports.modifySauce = (req, res, next) => {
  let sauce;
  if (req.file) {
    sauce = new Sauce({
      ...req.body,
      imageUrl: getImageUrl(req),
      _id: req.params.id,
    });
  } else {
    sauce = new Sauce({
      ...req.body,
      _id: req.params.id,
    });
  }
  Sauce.updateOne({ _id: req.params.id }, sauce)
    .then(() => {
      res.status(201).json({
        message: 'La sauce a été mise à jour',
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      res.status(404).json({
        error: new Error("Cette sauce n'existe pas"),
      });
    }
    if (sauce.userId !== req.auth.userId) {
      res.status(400).json({
        error: new Error('Demande non autorisée'),
      });
    }
    const fileName = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${fileName}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => {
          res.status(200).json({
            message: 'Sauce supprimée',
          });
        })
        .catch((error) => {
          res.status(400).json({
            error: error,
          });
        });
    });
  });
};

// Donner son avis sur une sauce (like / Dislike)
exports.likeSauce = (req, res, next) => {
  if (req.body.like === 1) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { likes: req.body.like++ },
        $push: { usersLiked: req.body.userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: 'Like ajouté !' }))
      .catch((error) => res.status(400).json({ error }));
  } else if (req.body.like === -1) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { dislikes: req.body.like++ * -1 },
        $push: { usersDisliked: req.body.userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: 'Dislike ajouté !' }))
      .catch((error) => res.status(400).json({ error }));
  } else {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
          )
            .then((sauce) => {
              res.status(200).json({ message: 'Like supprimé !' });
            })
            .catch((error) => res.status(400).json({ error }));
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersDisliked: req.body.userId },
              $inc: { dislikes: -1 },
            }
          )
            .then((sauce) => {
              res.status(200).json({ message: 'Dislike supprimé !' });
            })
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};
