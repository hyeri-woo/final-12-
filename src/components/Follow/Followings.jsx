import React, { useState, useEffect } from 'react';
import FollowList from './FollowList';
import { useRecoilState } from 'recoil';
import { accountname } from '../../atom/loginAtom';
import { useInView } from 'react-intersection-observer';

export default function Followings({ following, token }) {
  const [myAccountname, setMyAccountname] = useRecoilState(accountname);
  const [ref, inView] = useInView();
  const [page, setPage] = useState(0);

  // 팀 계정을 리스트 상단에 올리기 위해 분류
  const sortedData = [...following].sort((a, b) => {
    if (b.accountname.startsWith('SPORT_')) {
      return 1;
    } else {
      return -2;
    }
  });

  useEffect(() => {
    if (inView) {
      setPage((prev) => prev + 15);
    }
  }, [inView]);

  return (
    <>
      <h1 className='a11y-hidden'>팔로잉 목록</h1>
      <ul>
        {sortedData.map((item, index) => {
          if (index < page) {
            return (
              <FollowList
                key={index}
                username={item.username}
                accountname={item.accountname}
                image={item.image}
                page='followings'
                isfollow={item.isfollow}
                isMyAccount={item.accountname === myAccountname}
                token={token}
              />
            );
          }
        })}
        <span ref={ref} />
      </ul>
    </>
  );
}
