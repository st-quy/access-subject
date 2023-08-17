import React, { useEffect, useState } from "react";

import "./App.css";
import {
  Col,
  Row,
  Typography,
  Divider,
  Button,
  Checkbox,
  Form,
  Input,
  Upload,
  Radio,
  message,
  Space,
  Popover,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import axios from "axios";
import { createSign } from "./helpers/convertMd5";

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<any>();
  const [faceImg, setImageUrl1] = useState<RcFile>();
  const [token, setToken] = useState<string>();
  const [params, setParams] = useState({
    name: "",
    gender: 1,
    face_group_id: 14,
    store_id: 26,
    note: "",
  });

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/jpg";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }

    return isJpgOrPng && isLt2M;
  };

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    setImageUrl1(info.file.originFileObj);
    if (info.file.status === "uploading") {
      setLoading(true);

      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setImageUrl(url);
      });

      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }

    return e?.fileList;
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const getToken = () => {
    return axios.get(
      "https://api-trungnam.stunited.vn/api/auth/get-only-token"
    );
  };

  useEffect(() => {
    getToken().then((res) => {
      setToken(res.data.token);
    });
  }, []);

  const onFinish = async (values: any) => {
    const sign = createSign(params, token as any);
    if (token && sign) {
      await axios({
        method: "post",
        url: "https://digieye.viotgroup.com/phpapi/accessControl/target/add",
        data: { ...params, faceImg },
        headers: {
          "Content-Type": "multipart/form-data",
          Token: token,
          Sign: sign as any,
        },
      });
    }
  };
  return (
    <div className="subject-container">
      <Row className="form__container">
        <Col xs={24} sm={24} md={24}>
          <Row className="header__container">
            <Col xs={24} sm={24} md={24}>
              <Typography.Text className="form__title">
                Add New Subject
              </Typography.Text>
              <Divider />
            </Col>
          </Row>
          <Row className="content__container">
            <Col xs={24} sm={24} md={24}>
              <Form
                name="basic"
                // initialValues={{ remember: true }}
                autoComplete="off"
                {...formItemLayout}
                onFinish={onFinish}
              >
                <Form.Item label="Select Picture" required>
                  <Form.Item
                    name="faceImg"
                    // wrapperCol={{ span: 6 }}
                    valuePropName="faceImg"
                    getValueFromEvent={normFile}
                    noStyle
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "This field cannot be left blank",
                    //   },
                    // ]}
                    style={{ width: "100px" }}
                  >
                    <Space direction="horizontal">
                      <Upload
                        name="faceImg"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                        beforeUpload={beforeUpload}
                        onChange={handleChange}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="avatar"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          uploadButton
                        )}
                      </Upload>
                      <Space direction="vertical">
                        <Typography.Text>
                          Only support jpg format, file size not more than 2M,
                          picture pixel limit is 960*960, face pixel not less
                          than 120*120.
                        </Typography.Text>
                        <Space direction="horizontal">
                          <Typography.Text>Standard Example</Typography.Text>
                          <Popover
                            content={
                              <>
                                <img
                                  src="https://digieye.viotgroup.com/static/img/subject.61581497.jpg"
                                  alt="avatar"
                                  style={{
                                    width: "200px",
                                    height: "240px",
                                    objectFit: "cover",
                                  }}
                                />
                              </>
                            }
                          >
                            <img
                              src="https://digieye.viotgroup.com/static/img/subject.61581497.jpg"
                              alt="avatar"
                              style={{
                                width: "100px",
                                height: "140px",
                                objectFit: "cover",
                              }}
                            />
                          </Popover>
                        </Space>
                        <Typography.Text>
                          The face must be authentic and without retouching, the
                          white background is preferred, the face is required to
                          be clear and the light is uniform.
                        </Typography.Text>
                      </Space>
                    </Space>
                  </Form.Item>
                </Form.Item>

                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message:
                        "Must be 2 to 60 characters, can only contain letters, digits and spaces.!",
                    },
                  ]}
                >
                  <Input
                    onChange={(e) => {
                      setParams({ ...params, name: e.target.value });
                    }}
                  />
                </Form.Item>
                <Form.Item
                  required
                  name="gender"
                  label="Gender"
                  rules={[
                    {
                      required: true,
                      message: "This field cannot be left blank",
                    },
                  ]}
                >
                  <Radio.Group
                    onChange={(e) => {
                      setParams({ ...params, gender: e.target.value });
                    }}
                  >
                    <Radio value={1}>Male</Radio>
                    <Radio value={2}>Female</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item name="note" label="Notes">
                  <Input.TextArea
                    showCount
                    maxLength={150}
                    onChange={(e) => {
                      setParams({ ...params, note: e.target.value });
                    }}
                  />
                </Form.Item>
                <Form.Item name="store_id" label="Select Location">
                  <Input defaultValue="Sophia Demo" disabled />
                </Form.Item>
                <Form.Item name="face_group_id" label="Select Group" required>
                  <Checkbox
                    value={14}
                    style={{ lineHeight: "32px" }}
                    disabled
                    checked
                  >
                    Demo
                  </Checkbox>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};
export default App;
