import styled from 'styled-components';

const Title = styled.h1`
  color: white;
  background-color: brown;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 300px;
`;

function Styledlib() {
  return <Title>This is styled component</Title>;
}

export default Styledlib;