import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Common/Header/Header';
import styled from 'styled-components';
import { ProfileImage36 } from '../components/Common/ProfileImage';
import { UploadButton } from '../components/Common/Button/ImageButton';
import { GET_API, PUT_API } from '../api/CommonAPI';
import { useNavigate } from 'react-router-dom';
import { userToken } from '../atom/loginAtom';
import { useRecoilState } from 'recoil';

const USection = styled.section`
  padding: 70px 20px;

  .form-wrapper {
    width: 100%;
    display: flex;
    gap: 10px;
  }

  form {
    position: relative;
    width: 100%;
  }

  textarea {
    width: 100%;
    padding: 10px;
    border: none;
    resize: none;
    outline-color: var(--color-navy);
  }

  .upload-images-wrapper {
    margin-top: 10px;
    display: flex;
    gap: 20px;
    padding-left: 60px;
    overflow: scroll;
  }

  .image-wrapper {
    position: relative;
  }
  .upload-image {
    width: 150px;
    height: 150px;
    flex-shrink: 0;
  }

  .delete-button {
    width: 50px;
    position: absolute;
    top: 10px;
    right: 10px;
  }

  img {
    border: 1px solid black;
    border-radius: 20px;
  }
`;

const StyledProfileImage36 = styled(ProfileImage36)`
  flex-shrink: 0;
`;

const StyledUploadButton = styled(UploadButton)`
  position: fixed;
  bottom: 30px;
  right: 30px;
`;

export default function EditPost(props) {
  // 직접 받아올 때 사용
  const [token, setToken] = useRecoilState(userToken);
  const postId = props.postid;

  // 요청에 사용하는 url
  const url = '/post';

  // test정보
  // const token =
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ODkyNWZmYjJjYjIwNTY2MzMzY2Y4MyIsImV4cCI6MTY5MTg5NDU0MCwiaWF0IjoxNjg2NzEwNTQwfQ.CMVKaojlNSWLjmtbZ_AY6shkkStQgp1DHP3z87oIPe8';
  const test_postId = '64954319b2cb20566376acd8';

  //useState들
  // 받아온 게시물 데이터
  const [post, setPost] = useState([]);
  // 업로드할 게시물 텍스트
  const [text, setText] = useState('');
  //업로드할 게시물 이미지 여러개
  const [images, setImages] = useState([]);
  //업로드할 게시물 이미지 서버주소
  const [imageUrl, setImageUrl] = useState('');

  const navigate = useNavigate();

  // 이전 데이터 요청
  useEffect(() => {
    const prevPost = async (e) => {
      // const res = await GET_API(token, '/post/64954319b2cb20566376acd8');
      const res = await GET_API(token, '/post/' + test_postId);
      // const res = await GET_API(token, '/post/' + postId);
      console.log(res);
      setPost(res);
    };
    prevPost();
  }, []);
  // console.log(post);

  // post값이 바뀌면 post길이가 0보다 큰지 확인해서 값을 바꿔준다.
  useEffect(() => {
    console.log('use effect 실행 post 바뀜');
    // 이건 왜 안되지
    // if (post.length > 0) {
    // if (post.length) {

    // 첫 렌더링시 빈 배열[] 예외처리
    if (post.length !== 0) {
      console.log('post');
      console.log(post);
      console.log('image');
      console.log(post.post.image);
      console.log('content');
      console.log(post.post.content);

      // 불러온 이미지리스트 분리해서 넣어준다
      // const previurl = post.post.image.split(',');
      if (post.post.image !== []) {
        const previurl = post.post.image.split(',');
        setImages(previurl);
      }

      console.log(images);

      // 불러온 게시물 글 넣기
      // 문제 : 별로 리액트 같지 않음
      document.querySelector('.text-area').value = post.post.content;
      setText(post.post.content);
    }
  }, [post]);

  //게시글 내용
  // textarea가 바뀌면 내용을 가져와서 setText()로 text에 넣어줌
  const postContent = (e) => {
    console.log('내용 바뀜');
    // console.log(e.target.value);
    setText(e.target.value);
  };
  // postContent 끝

  // 이미지를 삭제하는 함수
  const imageDeleteModify = (e) => {
    console.log('이미지 삭제');

    // 누른 버튼의 아이디값(키와 동일)을 가져옴
    const deleteImage = e.currentTarget.getAttribute('id');

    // 선택한 키값의 이미지가 없는 새로운 배열 만들기
    const modify = images.filter((image) => image !== deleteImage);
    console.log(modify);

    // setImages로 새로운 이미지 넣기
    setImages(modify);
    // setImage([]);
  };
  // imageDeleteModify 끝

  // 게시글 내용을 서버에 업로드 하는 함수
  const handleSubmitModify = async () => {
    if (text === '' || images === []) {
      alert('사진이나 이미지는 비워둘 수 없습니다');
      return;
    }
    const bodyData = {
      'post': {
        'content': text,
        'image': imageUrl,
      },
    };
    const data = await PUT_API(
      token,
      // '/post/64954319b2cb20566376acd8',
      '/post/' + test_postId,
      // '/post/' + postId,
      bodyData,
    );
    console.log(data);

    // 일단 수정한 포스트 페이지로 이동하도록
    // navigate('/post/64954319b2cb20566376acd8');
    navigate('/post/' + test_postId);
    // navigate('/post/' + postId);
  };
  // handleSubmitModify 끝

  // 이미지 여러개를 하나씩 선택해서 올림 (업로드 버튼 클릭 여러번)
  const imageUploadModify = async (e) => {
    console.log('이미지 변경');
    //input이 변경되면 변경된 요소를 가져온다
    const imageFile = e.target.files[0];

    // 사진 갯수 제한
    if (images.length > 2) {
      alert('사진은 3장까지만 가능합니다');
      return;
    }
    if (imageFile.length > 2) {
      alert('사진은 3장까지만 가능합니다');
      return;
    }
    console.log(imageFile);

    //폼데이터를 만들고 내 데이터를 추가
    const formData = new FormData();
    // for (let i = 0; i < imageFile.length; i++) {
    //   formData.append('image', imageFile[i]);
    // }
    formData.append('image', imageFile);
    console.log(formData);

    //요청
    const res = await fetch(
      'https://api.mandarin.weniv.co.kr/image/uploadfiles',
      {
        method: 'POST',
        body: formData,
      },
    );

    // //데이터를 json으로 받아오기
    const json = await res.json();
    console.log(json);

    const fileUrl = json.map((img) => {
      return 'https://api.mandarin.weniv.co.kr/' + img.filename;
    });

    setImages([...images, ...fileUrl]);
    // console.log(fileUrl);

    console.log(images);
    // console.log(fileUrl);
    // setImages(fileUrl);
  };
  // imageUploadModify 끝

  //콘솔에서 이미지 확인
  // console.log(image);

  // 이미지 전송을 위해 이미지 주소 이어 붙이기
  const iurl = images.join(',');
  // console.log(iurl);

  // iurl이 바뀔때만 setImageUrl로 imageUrl 변경
  useEffect(() => {
    setImageUrl(iurl);
  }, [iurl]);

  // console.log(images);
  // console.log(imageUrl);

  // textarea의 길이를 들어오는 게시글에 따라서 조정되게 하는 함수
  const autoResizeTextarea = () => {
    let textarea = document.querySelector('.text-area');

    if (textarea) {
      textarea.style.height = 'auto';
      let height = textarea.scrollHeight; // 높이
      textarea.style.height = `${height + 8}px`;
    }
  };
  // autoResizeTextarea 끝

  //////////
  //렌더링
  return (
    <>
      <Header upload onUploadClick={handleSubmitModify} />
      <USection>
        <section className='form-wrapper'>
          {/* <ProfileImage36 /> */}
          <StyledProfileImage36 />
          <form>
            <textarea
              className='text-area'
              placeholder='게시글 입력하기...'
              // rows={1}
              onKeyDown={autoResizeTextarea}
              onKeyUp={autoResizeTextarea}
              onChange={postContent}
            ></textarea>
            {/* <StyledUploadButton /> */}
            <StyledUploadButton func={imageUploadModify} />
          </form>
        </section>
        <section className='upload-images-wrapper'>
          {/* image가 null이면 렌더링 되지 않게 */}
          {/* 이미지 여러개일때 */}
          {/* 다른데서는 됐는데 여기서는 왜 안될까 */}
          {/* {images&& */}
          {console.log(images)}
          {
            //
            images &&
              // images.length !== 0 &&
              // images !== [''] &&
              // images !== [] &&
              // images !== '' &&
              // images !== [] &&
              images.map((image) => {
                return (
                  <article className='image-wrapper' key={image}>
                    {console.log('그림 띄우기')}
                    {/* 버튼에 키와 같은 아이디를 넣어서 버튼 선택 시 이미지를 선택할 수 있도록 하는데 맘에 안듬 ??????? */}
                    <button
                      className='delete-button'
                      id={image}
                      onClick={imageDeleteModify}
                    >
                      삭제버튼
                    </button>
                    <img className='upload-image' width={'100%'} src={image} />
                  </article>
                );
              })
          }
        </section>
      </USection>
    </>
  );
}