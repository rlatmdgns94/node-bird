import React, {useState, useCallback, useRef } from 'react'
import {Button, Form, Input} from 'antd'
import {useDispatch, useSelector} from 'react-redux'
import { addPost } from '../reducers/post';

const PostForm =()=> {
  const {imagePaths} = useSelector((state) => state.post);
  const dispatch = useDispatch();
  const [text, setText] = useState('') 
  const imageInput = useRef();
  const onClickImageUpload = useCallback(() => {
    imageInput.current.click();  
  }, [imageInput.current])
  const onChange = useCallback((e) => {
    setText(e.target.value)
  }, [])
  const onSubmit = useCallback(() => {
    dispatch(addPost)
    setText('');
  }, [])
  return (
    <Form style ={{margin: '10px 0 20px'}} encType="multipart/form-data" onFinish={onSubmit}>
      <Input.TextArea value={text} onChange={onChange} maxLength={140} placeholder="어떤 신기한 일이 있었나요?"/>
      <div>
        <input type="file" multiple hidden ref={imageInput}/>
        <Button onClick={onClickImageUpload}>이미지 업로드</Button>
        <Button type="primary" style={{float:'right'}} htmlType="submit">쨱쨱</Button>
      </div>
      <div>
        {imagePaths.map((v) => (
          <div key={v} style={{display:'inline-block'}}>
            <img src={v} style={{width:'200px'}} alt={v}/>
            <div>
              <Button>제거</Button>
            </div>
          </div>
        ))}
      </div>
    </Form>
  )
}

export default PostForm
