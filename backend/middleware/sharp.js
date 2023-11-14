const sharp = require('sharp');
const path = require('path');
const fs = require('fs')

module.exports = (req, res, next) => {
    const tailleLimiteEnKo = 300;
    if (req.file && req.file.size > tailleLimiteEnKo * 1024) {
        const imageOriginalPath = req.file.path;
        const imageDirectory = path.dirname(imageOriginalPath);
        const imageExtension = path.extname(imageOriginalPath);
        const imageBaseName = path.basename(imageOriginalPath, imageExtension);
        const imageResizedPath = path.join(imageDirectory, imageBaseName + '-resized' + imageExtension);

        sharp(imageOriginalPath) 
            .resize(600,null,{
                fit:"inside" 
            }).jpeg({quality:80})
            .toFile(imageResizedPath, (err) => {
                if (err) {
                    console.error('Erreur lors du redimensionnement de l\'image :', err);
                    return res.status(500).json({ error: 'Erreur lors du redimensionnement de l\'image' });
                }
                fs.unlink(`${imageOriginalPath}`, (err) => {
                    if (err) {
                    return res.status(404).json({ error: "Erreur lors de la suppression du fichier" });
                    }});

                console.log("Image redimensionnée avec succès.");
                req.file.filename = imageBaseName + '-resized' + imageExtension;
                next();
            });
    } else {

        next();
    }
};
