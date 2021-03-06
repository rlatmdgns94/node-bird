const express = require('express');
const multer = require('multer');
const path = require('path');

const { Post, Image, Comment, User } = require('../models');
const { isLoggedIn } = require('./middlewares');


const router = express.Router();

const  upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done){
      done(null, 'uploads');
    },
    filename(req, file, done){
      const ext = path.extname(file.originalname); // 확장자 추출 .png
      const basename = path.basename(file.originalname, ext)
      done(null, basename + '_' + new Date().getTime() + ext);
    },
  }),
  limits : {fileSize: 20 * 1024 * 1024},
});
router.post('/images', isLoggedIn, upload.array('image'), (req, res, next) => {
  console.log(req.files);
  res.json(req.files.map((v)=> v.filename))
})


router.post('/', isLoggedIn, upload.none(), async(req, res, next) => {
  try{
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    if(req.body.image){
      if(Array.isArray(req.body.image)){  //이미지를 여러개 올린경우 배열로 올라감 [.png , .png]
        const images = await Promise.all(req.body.image.map((image) =>  Image.create({src : image})));
        await post.addImages(images);
      }else{ // 하나만 올린경우
        const images = await Image.create({src : req.body.image});
        await post.addImages(images);
      }
    }
    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [{
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User, // 댓글 작성자
          attributes: ['id', 'nickname'],
        }],
      }, {
        model: User, // 게시글 작성자
        attributes: ['id', 'nickname'],
      }, {
        model: User, // 좋아요 누른 사람
        as: 'Likers',
        attributes: ['id'],
      }]
    })
    res.status(201).json(fullPost);
  }catch(error){
    console.error(error);
    next(error);
  }
})


router.post('/:postId/comment', isLoggedIn, async (req, res, next) => { // POST /post/1/comment
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    const comment = await Comment.create({
      content: req.body.content,
      PostId: parseInt(req.params.postId, 10),
      UserId: req.user.id,
    })
    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [{
        model: User,
        attributes: ['id', 'nickname'],
      }],
    })
    res.status(201).json(fullComment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/:postId/like', isLoggedIn, async (req, res, next) => { // PATCH /post/1/like
  try {
    const post = await Post.findOne({ where: { id: req.params.postId }});
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }
    await post.addLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


router.delete('/:postId', isLoggedIn, async (req, res, next) => { // DELETE /post/10
  try {
    await Post.destroy({
      where: {
        id: req.params.postId,
        UserId: req.user.id,
      },
    });
    res.status(200).json({ PostId: parseInt(req.params.postId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
module.exports = router