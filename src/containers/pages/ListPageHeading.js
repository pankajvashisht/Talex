import React, { Component } from 'react';
import { Row, Button, UncontrolledDropdown, DropdownMenu, DropdownItem, DropdownToggle, Collapse } from 'reactstrap';
import { injectIntl } from 'react-intl';

import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import IntlMessages from '../../helpers/IntlMessages';

import { ThumbListIcon } from '../../components/svg';
class ListPageHeading extends Component {
	constructor(props) {
		super();
		this.state = {
			dropdownSplitOpen: false,
			displayOptionsIsOpen: false
		};
	}

	toggleDisplayOptions = () => {
		this.setState((prevState) => ({
			displayOptionsIsOpen: !prevState.displayOptionsIsOpen
		}));
	};
	toggleSplit = () => {
		this.setState((prevState) => ({
			dropdownSplitOpen: !prevState.dropdownSplitOpen
		}));
	};

	render() {
		const { messages } = this.props.intl;
		const {
			displayMode,
			changeDisplayMode,

			changePageSize,
			selectedPageSize,
			totalItemCount,

			startIndex,
			endIndex,
			addShow,
			Addname,
			onSearchKey,
			toggleModal,
			pageSizes,
			heading
		} = this.props;

		const { displayOptionsIsOpen } = this.state;
		return (
			<Row>
				<Colxx xxs="12">
					<div className="mb-2">
						<h1>
							<IntlMessages id={heading} />
						</h1>

						<div className="text-zero top-right-button-container">
							{addShow && (
								<Button
									color="primary"
									size="lg"
									className="top-right-button"
									onClick={() => toggleModal()}
								>
									<IntlMessages id={Addname} />
								</Button>
							)}

							{'  '}
							{/* <ButtonDropdown
                isOpen={dropdownSplitOpen}
                toggle={this.toggleSplit}>
                <div className="btn btn-primary btn-lg pl-4 pr-0 check-button check-all">
                    <CustomInput
                      className="custom-checkbox mb-0 d-inline-block"
                      type="checkbox"
                      id="checkAll"
                      checked={selectedItemsLength >= itemsLength}
                      onChange={() => handleChangeSelectAll(true)}
                      label={
                        <span
                          className={`custom-control-label ${
                            selectedItemsLength > 0 &&
                            selectedItemsLength < itemsLength
                              ? "indeterminate"
                              : ""
                          }`}
                        />
                      }
                    />
                </div>
                <DropdownToggle
                  caret
                  color="primary"
                  className="dropdown-toggle-split btn-lg"/>
                <DropdownMenu right>
                  <DropdownItem>
                    <IntlMessages id="pages.delete" />
                  </DropdownItem>
                  <DropdownItem>
                    <IntlMessages id="pages.another-action" />
                  </DropdownItem>
                </DropdownMenu>
              </ButtonDropdown> */}
						</div>
						{/* <Breadcrumb match={match} /> */}
					</div>

					<div className="mb-2">
						<Button
							color="empty"
							className="pt-0 pl-0 d-inline-block d-md-none"
							onClick={this.toggleDisplayOptions}
						>
							<IntlMessages id="pages.display-options" />{' '}
							<i className="simple-icon-arrow-down align-middle" />
						</Button>
						<Collapse isOpen={displayOptionsIsOpen} className="d-md-block" id="displayOptions">
							<span className="mr-3 d-inline-block float-md-left">
								<a
									href="#/"
									className={`mr-2 view-icon ${displayMode === 'thumblist' ? 'active' : ''}`}
									onClick={() => changeDisplayMode('thumblist')}
								>
									<ThumbListIcon />
								</a>
							</span>

							<div className="d-block d-md-inline-block pt-1">
								<UncontrolledDropdown className="mr-1 float-md-left btn-group mb-1" />
								<div className="search-sm d-inline-block float-md-left mr-1 mb-1 align-top">
									<input
										type="text"
										name="keyword"
										id="search"
										placeholder={messages['menu.search']}
										onChange={(e) => onSearchKey(e)}
									/>
								</div>
							</div>
							<div className="float-md-right pt-1">
								<span className="text-muted text-small mr-1">{`${startIndex}-${endIndex} of ${totalItemCount} `}</span>
								<UncontrolledDropdown className="d-inline-block">
									<DropdownToggle caret color="outline-dark" size="xs">
										{selectedPageSize}
									</DropdownToggle>
									<DropdownMenu right>
										{pageSizes.map((size, index) => {
											return (
												<DropdownItem key={index} onClick={() => changePageSize(size)}>
													{size}
												</DropdownItem>
											);
										})}
									</DropdownMenu>
								</UncontrolledDropdown>
							</div>
						</Collapse>
					</div>
					<Separator className="mb-5" />
				</Colxx>
			</Row>
		);
	}
}

export default injectIntl(ListPageHeading);
