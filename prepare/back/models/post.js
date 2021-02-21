module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', { // Mysql에는 Posts 테이블 생성  / Post 모델이름인데 모델이름이 자동으로 소문자가 되고 복수가 되어서 mysql에 저장됨 
    //id가 이번족으로 들어있음
    content:{
      type: DataTypes.TEXT,
      allowNull:false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci', // 한글저장
  });
  Post.associate = (db) => {};
  return Post;
};