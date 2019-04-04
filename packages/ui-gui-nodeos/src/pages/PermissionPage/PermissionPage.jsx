import React, { Component } from 'react';
import { 
  Card, CardBody, CardHeader, 
  ButtonGroup, Button, Row, Col 
} from 'reactstrap';

import { StandardTemplate } from 'templates';
import { connect } from 'react-redux';

import CreateAccount from './components/CreateAccount';
import Permissionlist from './components/Permissionlist';
import ImportAccount from './components/ImportAccount';

import { panelSelect } from './PermissionPageReducer';
import { fetchStart, accountClear } from 'reducers/permission';
import styled from 'styled-components';
import { PageTitleDivStyled, CardStyled, ButtonPrimary, ButtonSecondary, InputStyled} from 'styled';

const FirstCardStyled = styled(CardStyled)`
  border-top: solid 2px #1173a4;
`
const CustomButton = styled(ButtonSecondary)`
  padding-top: 4px;
  line-height: 15px;
`

class PermissionPage extends Component {
  render() {

    const { panelSelect, panel, accountClear, fetchStart } = this.props;

    // Initialize local redux store state, then re-fetch MongoDB permissions
    function reInitialize () {
      accountClear();
      fetchStart();
    }
    
    return (
      <StandardTemplate>
        <div className="PermissionPage">          
          <Row>
            <Col sm="2"></Col>
            <Col sm="8">
              <Row>
                <Col sm="12">
                  <PageTitleDivStyled>Managed Accounts</PageTitleDivStyled>
                </Col>
              </Row>
              <Row>
                <Col sm="12">
                  <FirstCardStyled>                  
                  <CardBody>
                      <Row className="clearfix">
                        <Col sm={12}>
                          { panel === "permission-list"
                            ? <ButtonGroup className="float-right">
                                <ButtonPrimary onClick={()=>{panelSelect("create-account")}}>Create Account</ButtonPrimary>
                                <CustomButton onClick={()=>reInitialize()}>Reset All Permissions</CustomButton>
                              </ButtonGroup>
                            : <ButtonPrimary className="float-right" onClick={()=>{panelSelect("permission-list")}}>Back</ButtonPrimary>
                          }
                        </Col>
                      </Row>
                      <br/>
                      <Row>
                        <Col sm={12}>
                          { panel === "permission-list" ? <Permissionlist/>
                            : panel === "create-account" ? <CreateAccount/>
                            : <ImportAccount />
                          }
                        </Col>
                      </Row>
                  </CardBody>
                </FirstCardStyled>
                </Col>
              </Row>            
            </Col>
            <Col sm="2"></Col>
          </Row>
          
          
          
        </div>
      </StandardTemplate>
    );
  }
}

export default connect(
  ({ permission, permissionPage: { panel } }) => ({
    permission, panel,
  }),
  {
    panelSelect,
    fetchStart,
    accountClear
  }
)(PermissionPage);
