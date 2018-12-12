import React, { Component } from 'react';

// HOC to manage the state required for the base doc component
// Expects to be wrapped by withConfig HOC
function withDocRouting(WrappedComponent) {
    return class ComponentWithDocRouting extends Component {
        constructor(props) {
            super(props);
            this.state = {
                activeHeader: '',
                prevDoc: undefined,
                nextDoc: undefined,
                menu: undefined
            }
        }

        static getInitialProps = async (context) => {
            const { page, section, doc } = context.query;
            let props = {};
            try {
                const content = await require(`../documentation/${page}/${section}/${doc}.md`);
                props = { statusCode: 200, content, page, section, doc };
            } catch(err) {
                props = { statusCode: 404, content: '', page };
            }
            // Call the wrapped components getInitialProps and add to props passed down
            if (WrappedComponent.hasOwnProperty('getInitialProps')) {
                return { ...props, ...WrappedComponent.getInitialProps(context) };
            }
            return props;
        }

        componentDidMount() {
            this.setPaging();
        }

        componentDidUpdate(prevProps) {
            if (prevProps.content !== this.props.content) {
                this.setPaging();
            }
        }

        setPaging() {
            const { doc, page, config } = this.props;
            this.setState({ ...docs(config.toc).getSurroundingDocs(page, doc) });
        }

        watchScroll = id => this.setState({ activeHeader: id });

        watchMenu = menu => this.setState({ menu });

        render() {
            return (
                <WrappedComponent
                    activeHeader={this.state.activeHeader}
                    prevDoc={this.state.prevDoc}
                    nextDoc={this.state.nextDoc}
                    menu={this.state.menu}
                    watchScroll={this.watchScroll}
                    watchMenu={this.watchMenu}
                    {...this.props}
                />
            );
        }
    }
}

export default withDocRouting;