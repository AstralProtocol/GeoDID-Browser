import React, { useState } from 'react';
import { List, Button, Menu, Tag } from 'antd';
import { connect } from 'react-redux';
import { useSubscription } from '@apollo/react-hooks';
import { CodeBlock, nord } from 'react-code-blocks';
import { fetchSpatialAsset } from 'core/redux/spatial-assets/actions';
import spatialAssetsSubscription from 'core/graphql/spatialAssetsSubscription';
import { SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';

const OPEN_KEYS = ['sub1', 'sub2'];
const { SubMenu } = Menu;

const Browse = (props) => {
  const {
    selectedAccount,
    dispatchFetchSpatialAsset,
    spatialAsset,
    fetchingSpatialAsset,
    fetchedSpatialAsset,
    spatialAssetId,
  } = props;
  const [openKeys, setOpenKeys] = useState(OPEN_KEYS);

  // const [visible, setVisible] = useState(false);

  const { data, loading } = useSubscription(spatialAssetsSubscription, {
    variables: {
      where: {
        ...(selectedAccount ? { owner: selectedAccount } : {}),
        ...{ active: true },
      },
    },
  });

  const browsedSpatialAssets = data && data.spatialAssets;
  const onOpenChange = (okeys) => setOpenKeys([...OPEN_KEYS, ...okeys]);

  const handleStacLoad = (stacId) => {
    dispatchFetchSpatialAsset(stacId);
  };

  let codeBlock;

  if (spatialAsset && Object.entries(spatialAsset).length !== 0) {
    codeBlock = (
      <CodeBlock
        customStyle={{
          height: '100vh',
          overflow: 'scroll',
        }}
        text={JSON.stringify(spatialAsset, null, 2)}
        language="json"
        theme={nord}
      />
    );
  } else {
    codeBlock = (
      <div style={{ height: '100vh', textAlign: 'center' }}>Register or load a STAC item</div>
    );
  }

  const button = (id) => {
    let loadButton;

    if (id === spatialAssetId) {
      if (!fetchingSpatialAsset && !fetchedSpatialAsset) {
        loadButton = (
          <Button block type="primary" onClick={() => handleStacLoad(id)}>
            Load
          </Button>
        );
      } else if (fetchingSpatialAsset && !fetchedSpatialAsset) {
        loadButton = (
          <div style={{ textAlign: 'center' }}>
            <Tag icon={<SyncOutlined spin />} color="processing">
              Loading Spatial Asset
            </Tag>
          </div>
        );
      } else if (!fetchingSpatialAsset && fetchedSpatialAsset) {
        loadButton = (
          <div style={{ textAlign: 'center' }}>
            <Tag icon={<CheckCircleOutlined />} color="success">
              STAC item loaded
            </Tag>
          </div>
        );
      }
    } else {
      loadButton = (
        <Button block type="primary" onClick={() => handleStacLoad(id)}>
          Load
        </Button>
      );
    }

    return loadButton;
  };
  return (
    <Menu
      theme="dark"
      mode="inline"
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      forceSubMenuRender
    >
      <SubMenu key="sub1" title="STAC Items you own">
        <List
          itemLayout="vertical"
          loading={loading || !data}
          size="large"
          pagination={{
            pageSize: 2,
          }}
          dataSource={
            browsedSpatialAssets &&
            browsedSpatialAssets.map((sA) => ({
              id: sA.id,
              active: sA.active.toString(),
            }))
          }
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={
                  <div style={{ textAlign: 'center' }}>{`STAC ID: ${item.id.substr(
                    0,
                    6,
                  )} ... ${item.id.substr(-4)}`}</div>
                }
                description={button(item.id)}
              />
            </List.Item>
          )}
        />
      </SubMenu>
      <SubMenu key="sub2" title="Loaded STAC Item">
        {codeBlock}
      </SubMenu>
    </Menu>
  );
};

const mapStateToProps = (state) => ({
  web3: state.login.web3,
  selectedAccount: state.login.selectedAccount,
  spatialAsset: state.spatialAssets.spatialAsset,
  fetchingSpatialAsset: state.spatialAssets.fetchingSpatialAsset,
  fetchedSpatialAsset: state.spatialAssets.fetchedSpatialAsset,
  spatialAssetId: state.spatialAssets.spatialAssetId,
});

const mapStateToDispatch = (dispatch) => ({
  dispatchFetchSpatialAsset: (stacId) => dispatch(fetchSpatialAsset(stacId)),
});

export default connect(mapStateToProps, mapStateToDispatch)(Browse);
