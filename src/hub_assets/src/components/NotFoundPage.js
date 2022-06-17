import React, { useContext, useState, useEffect, useRef } from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = (props) => {

    const nav = useNavigate();

    return <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={<Button type="primary" onClick={() => {
        nav('/candidplush');
    }}>Back Home</Button>} />

}

export default NotFoundPage;